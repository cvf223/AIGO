#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';

config();

async function testDatabaseUrl() {
    console.log('🔍 Testing DATABASE_URL connection...');
    console.log(`📊 DATABASE_URL: ${process.env.DATABASE_URL}`);
    
    const db = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        const result = await db.query('SELECT NOW()');
        console.log('✅ DATABASE_URL connection successful');
        
        const totalCount = await db.query('SELECT COUNT(*) FROM pools');
        console.log(`📊 Total pools via DATABASE_URL: ${totalCount.rows[0].count}`);
        
        await db.end();
        
    } catch (error) {
        console.error('❌ DATABASE_URL connection failed:', error.message);
    }
}

testDatabaseUrl(); 