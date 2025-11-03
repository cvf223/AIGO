#!/usr/bin/env node
/**
 * 🗄️ PRODUCTION DATABASE INITIALIZATION
 * ======================================
 * 
 * Creates all required tables and initial data
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dbConnectionManager from '../src/database/DatabaseConnectionManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initializeDatabase() {
    console.log('🗄️ Initializing Production Database...');
    console.log('========================================');
    
    try {
        // Get database pool
        const pool = await dbConnectionManager.getPool();
        
        if (!pool) {
            console.error('❌ Could not connect to database');
            console.error('   💡 Check DATABASE_URL in .env');
            process.exit(1);
        }
        
        console.log('✅ Database connected');
        
        // Read and execute SQL file
        const sqlPath = join(__dirname, '../database/create-all-tables.sql');
        const sql = await readFile(sqlPath, 'utf8');
        
        console.log('📝 Creating tables...');
        
        const result = await pool.query(sql);
        
        console.log('✅ All tables created successfully');
        console.log('');
        console.log('📊 Database ready for Construction Syndicate');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeDatabase();
}

