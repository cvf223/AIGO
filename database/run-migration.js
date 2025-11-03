#!/usr/bin/env node

/**
 * 🗄️ DATABASE MIGRATION RUNNER
 * ============================
 * Runs the schema fix migration to resolve SQL errors
 */

import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    console.log('🗄️ DATABASE MIGRATION RUNNER');
    console.log('============================\n');
    
    // Database configuration
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'construction_syndicate',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
    };
    
    console.log('📊 Connecting to database...');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}\n`);
    
    const pool = new pg.Pool(dbConfig);
    
    try {
        // Test connection
        const client = await pool.connect();
        console.log('✅ Database connected successfully\n');
        
        // Read migration file
        const migrationPath = path.join(__dirname, 'migrations', 'fix-database-schema.sql');
        console.log('📄 Reading migration file...');
        const migrationSQL = await fs.readFile(migrationPath, 'utf8');
        console.log(`   Found ${migrationSQL.length} characters of SQL\n`);
        
        // Run migration
        console.log('🚀 Running migration...');
        console.log('   This may take a few moments...\n');
        
        await client.query(migrationSQL);
        
        // Verify the changes
        console.log('🔍 Verifying schema changes...\n');
        
        // Check agent_performance columns
        const columnsResult = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'agent_performance'
            ORDER BY ordinal_position;
        `);
        
        console.log('📊 agent_performance table columns:');
        columnsResult.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
        });
        
        // Check for indexes
        const indexResult = await client.query(`
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'agent_performance';
        `);
        
        console.log('\n📑 Indexes on agent_performance:');
        indexResult.rows.forEach(idx => {
            console.log(`   - ${idx.indexname}`);
        });
        
        // Check for new tables
        const tablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('system_observation_state', 'system_configuration', 'system_metrics', 'evolution_history')
            ORDER BY table_name;
        `);
        
        console.log('\n📋 Verification of new tables:');
        tablesResult.rows.forEach(tbl => {
            console.log(`   ✅ ${tbl.table_name} exists`);
        });
        
        // Check observation mode configuration
        const configResult = await client.query(`
            SELECT key, value, description
            FROM system_configuration
            WHERE key = 'observation_mode';
        `);
        
        if (configResult.rows.length > 0) {
            console.log('\n⚙️ Observation mode configuration:');
            const config = configResult.rows[0];
            console.log(`   Key: ${config.key}`);
            console.log(`   Value: ${JSON.stringify(config.value, null, 2)}`);
            console.log(`   Description: ${config.description}`);
        }
        
        client.release();
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log('🎉 All schema issues have been resolved');
        console.log('🚀 The system should now run without SQL errors');
        console.log('='.repeat(50) + '\n');
        
    } catch (error) {
        console.error('\n❌ MIGRATION FAILED!');
        console.error('='.repeat(50));
        console.error('Error:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.error('\n🔌 Cannot connect to database server');
            console.error('   Please check your database configuration');
        } else if (error.code === '28P01') {
            console.error('\n🔐 Authentication failed');
            console.error('   Please check your database credentials');
        } else if (error.code === '42P07') {
            console.error('\n⚠️ Some objects already exist');
            console.error('   This is normal if migration was partially run before');
        }
        
        console.error('\nFull error details:');
        console.error(error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the migration
runMigration().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
