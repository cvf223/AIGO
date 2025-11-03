#!/usr/bin/env node

/**
 * Run migration to add task_id column to agent_activations table
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'construction_syndicate',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 5,
    idleTimeoutMillis: 30000
};

async function runMigration() {
    const pool = new Pool(dbConfig);
    
    try {
        console.log('🔧 Running task_id column migration...');
        
        // Read SQL file
        const sqlPath = join(__dirname, 'migrations', 'fix-task-id-column.sql');
        const sql = readFileSync(sqlPath, 'utf8');
        
        // Execute migration
        await pool.query(sql);
        
        console.log('✅ Migration completed successfully');
        console.log('📋 Added task_id column to agent_activations table');
        
        // Verify the column exists
        const verifyQuery = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'agent_activations' 
            AND column_name = 'task_id'
        `;
        
        const result = await pool.query(verifyQuery);
        if (result.rows.length > 0) {
            console.log('✅ Verified: task_id column exists');
        } else {
            console.error('❌ Warning: task_id column not found after migration');
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigration().catch(console.error);
}

export default runMigration;
