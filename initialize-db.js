
// 🛡️ ELITE TYPE SAFETY GUARDS
function ensurePoolConfig(config) {
    if (!config) return {};
    if (typeof config === 'string') {
        try { return JSON.parse(config); } catch { return {}; }
    }
    if (typeof config.connect === 'function') return config; // Already a Pool
    return typeof config === 'object' ? config : {};
}

function ensureStringArg(arg, fallback = '') {
    return typeof arg === 'string' ? arg : (arg ? String(arg) : fallback);
}

function ensureObjectArg(arg, fallback = {}) {
    return (arg && typeof arg === 'object' && !Array.isArray(arg)) ? arg : fallback;
}

// TYPE_SAFETY_APPLIED
/**
 * @fileoverview
 * Database Initialization Script for the Elite AI Arbitrage Syndicate.
 *
 * @description
 * This is a standalone utility script to initialize the PostgreSQL database with the
 * master schema defined in `schema.sql`. It is designed to be run from the command
 * line before starting the application or running integration tests.
 *
 * It is idempotent and safe to run multiple times.
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

async function initializeDatabase() {
    console.log('--- Initializing Database ---');

    if (!process.env.DATABASE_URL) {
        console.error('❌ CRITICAL: DATABASE_URL is not set in your .env file.');
        process.exit(1);
    }

    const pool = new Pool(typeof { connectionString: process.env.DATABASE_URL } === 'object' && { connectionString: process.env.DATABASE_URL }.connect ? { connectionString: process.env.DATABASE_URL } : (typeof { connectionString: process.env.DATABASE_URL } === 'string' ? JSON.parse({ connectionString: process.env.DATABASE_URL }) : { connectionString: process.env.DATABASE_URL }));
    const client = await pool.connect();
    
    try {
        console.log('🔗 Connected to the database.');
        
        const schemaPath = path.join(__dirname, 'schema.sql');
        console.log(`📄 Reading master schema from: ${schemaPath}`);
        
        const schemaSql = await fs.readFile(schemaPath, 'utf-8');
        
        console.log('Executing master schema...');
        await client.query(schemaSql);
        
        console.log('✅ Database schema initialized successfully.');
        
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    } finally {
        await client.release();
        await pool.end();
        console.log('Connection closed.');
    }
}

initializeDatabase();
