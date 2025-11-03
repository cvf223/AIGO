#!/usr/bin/env node

/**
 * 🔍 Debug Pool Loading Issue
 * 
 * Diagnose why the real-time monitor isn't loading pools from the database
 */

import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables from main .env file first
if (fs.existsSync('.env')) {
    config();
    console.log('🔧 Loaded environment from .env');
} else if (fs.existsSync('.env_after grabbing')) {
    config({ path: '.env_after grabbing' });
    console.log('🔧 Loaded environment from .env_after grabbing');
} else {
    console.log('⚠️ No .env file found, using process environment');
}

async function debugPoolLoading() {
    console.log('🔍 ===== DEBUGGING POOL LOADING ISSUE =====\n');
    
    // Step 1: Check database connection
    console.log('📊 Step 1: Testing database connection...');
    const db = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        database: process.env.PGDATABASE || 'arbitrage_db',
        user: process.env.PGUSER || 'epicbattlegods',
        password: process.env.PGPASSWORD || ''
    });
    
    try {
        const result = await db.query('SELECT NOW()');
        console.log('✅ Database connection successful');
        console.log(`   📅 Current time: ${result.rows[0].now}`);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\n🔧 Database configuration:');
        console.log(`   🏠 Host: ${process.env.PGHOST || 'localhost'}`);
        console.log(`   📡 Port: ${process.env.PGPORT || 5432}`);
        console.log(`   🗃️ Database: ${process.env.PGDATABASE || 'arbitrage_db'}`);
        console.log(`   👤 User: ${process.env.PGUSER || 'epicbattlegods'}`);
        console.log(`   🔐 Password: ${process.env.PGPASSWORD ? '[SET]' : '[NOT SET]'}`);
        process.exit(1);
    }
    
    // Step 2: Check if pools table exists
    console.log('\n📊 Step 2: Checking if pools table exists...');
    try {
        const tableCheck = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'pools'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('✅ pools table exists');
        } else {
            console.log('❌ pools table does not exist!');
            
            // Check what tables do exist
            const tables = await db.query(`
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            `);
            
            console.log('\n📋 Available tables:');
            tables.rows.forEach(row => {
                console.log(`   • ${row.table_name}`);
            });
            
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error checking table existence:', error.message);
        process.exit(1);
    }
    
    // Step 3: Check table structure
    console.log('\n📊 Step 3: Checking pools table structure...');
    try {
        const columns = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'pools'
            ORDER BY ordinal_position;
        `);
        
        console.log('📋 Table columns:');
        columns.rows.forEach(col => {
            console.log(`   • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Check specific columns we need
        const requiredColumns = ['address', 'dex', 'token0_address', 'token1_address', 'token0_symbol', 'token1_symbol', 'liquidity_usd', 'chain', 'is_active'];
        const existingColumns = columns.rows.map(col => col.column_name);
        
        console.log('\n🔍 Required columns check:');
        for (const col of requiredColumns) {
            if (existingColumns.includes(col)) {
                console.log(`   ✅ ${col}`);
            } else {
                console.log(`   ❌ ${col} - MISSING!`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error checking table structure:', error.message);
    }
    
    // Step 4: Check total rows in pools table
    console.log('\n📊 Step 4: Checking total pool count...');
    try {
        const totalCount = await db.query('SELECT COUNT(*) FROM pools');
        console.log(`📊 Total pools in database: ${totalCount.rows[0].count}`);
        
        if (parseInt(totalCount.rows[0].count) === 0) {
            console.log('❌ No pools found in database! This explains the issue.');
            console.log('💡 You need to run the pool discovery system first.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error counting pools:', error.message);
    }
    
    // Step 5: Check Arbitrum pools specifically
    console.log('\n📊 Step 5: Checking Arbitrum pools...');
    try {
        const arbitrumCount = await db.query(`
            SELECT COUNT(*) FROM pools 
            WHERE chain = 'arbitrum'
        `);
        console.log(`🔷 Arbitrum pools: ${arbitrumCount.rows[0].count}`);
        
        if (parseInt(arbitrumCount.rows[0].count) === 0) {
            console.log('❌ No Arbitrum pools found!');
            
            // Check what chains are available
            const chains = await db.query(`
                SELECT chain, COUNT(*) as count 
                FROM pools 
                GROUP BY chain 
                ORDER BY count DESC
            `);
            
            console.log('\n🔗 Available chains:');
            chains.rows.forEach(row => {
                console.log(`   • ${row.chain}: ${row.count} pools`);
            });
        }
    } catch (error) {
        console.error('❌ Error checking Arbitrum pools:', error.message);
    }
    
    // Step 6: Check active pools with liquidity
    console.log('\n📊 Step 6: Checking active pools with liquidity > $10,000...');
    try {
        const activePoolsQuery = `
            SELECT COUNT(*) FROM pools 
            WHERE chain = 'arbitrum' 
            AND is_active = true
            AND liquidity_usd > 10000
        `;
        
        const activePools = await db.query(activePoolsQuery);
        console.log(`💎 Active Arbitrum pools with >$10k liquidity: ${activePools.rows[0].count}`);
        
        if (parseInt(activePools.rows[0].count) === 0) {
            console.log('❌ No active pools meet the criteria!');
            
            // Check without liquidity filter
            const anyActive = await db.query(`
                SELECT COUNT(*) FROM pools 
                WHERE chain = 'arbitrum' 
                AND is_active = true
            `);
            console.log(`📊 Active Arbitrum pools (any liquidity): ${anyActive.rows[0].count}`);
            
            // Check without active filter
            const anyLiquidity = await db.query(`
                SELECT COUNT(*) FROM pools 
                WHERE chain = 'arbitrum' 
                AND liquidity_usd > 10000
            `);
            console.log(`💧 Arbitrum pools with >$10k liquidity (any status): ${anyLiquidity.rows[0].count}`);
            
            // Show some sample data
            const sampleData = await db.query(`
                SELECT address, dex, token0_symbol, token1_symbol, 
                       liquidity_usd, is_active, chain
                FROM pools 
                WHERE chain = 'arbitrum'
                LIMIT 5
            `);
            
            console.log('\n📋 Sample pool data:');
            sampleData.rows.forEach(pool => {
                console.log(`   • ${pool.token0_symbol}/${pool.token1_symbol} on ${pool.dex}`);
                console.log(`     💧 Liquidity: $${pool.liquidity_usd}`);
                console.log(`     ✅ Active: ${pool.is_active}`);
                console.log(`     🔗 Chain: ${pool.chain}`);
                console.log(`     📍 Address: ${pool.address}`);
                console.log('');
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking active pools:', error.message);
        console.log('🔍 Trying to understand the error...');
        
        // Try to run the exact query from the monitor
        try {
            const monitorQuery = `
                SELECT address, dex, token0_address, token1_address, 
                       token0_symbol, token1_symbol, liquidity_usd, chain
                FROM pools 
                WHERE chain = 'arbitrum' 
                AND is_active = true
                AND liquidity_usd > 10000
                ORDER BY liquidity_usd DESC
            `;
            
            console.log('🔍 Testing exact monitor query...');
            const monitorResult = await db.query(monitorQuery);
            console.log(`✅ Monitor query succeeded: ${monitorResult.rows.length} rows`);
            
            if (monitorResult.rows.length > 0) {
                console.log('\n🎯 SUCCESS! Pools are available, there might be a different issue.');
                console.log('📋 Sample pools that should be monitored:');
                
                monitorResult.rows.slice(0, 5).forEach(pool => {
                    console.log(`   • ${pool.token0_symbol}/${pool.token1_symbol} on ${pool.dex}`);
                    console.log(`     💧 Liquidity: $${parseFloat(pool.liquidity_usd).toLocaleString()}`);
                    console.log(`     📍 ${pool.address.slice(0, 12)}...`);
                });
            }
            
        } catch (queryError) {
            console.error('❌ Monitor query failed:', queryError.message);
        }
    }
    
    // Step 7: Test a simple version of the loadPools function
    console.log('\n📊 Step 7: Testing simplified pool loading...');
    try {
        const pools = await db.query(`
            SELECT address, dex, token0_address, token1_address, 
                   token0_symbol, token1_symbol, liquidity_usd, chain
            FROM pools 
            WHERE chain = 'arbitrum' 
            AND is_active = true
            AND liquidity_usd > 10000
            ORDER BY liquidity_usd DESC
            LIMIT 10
        `);
        
        console.log(`🎯 Query returned ${pools.rows.length} pools`);
        
        if (pools.rows.length > 0) {
            console.log('\n✅ POOLS FOUND! The database query works.');
            console.log('🔍 The issue might be in the monitor initialization process.');
            
            console.log('\n📋 Top pools available for monitoring:');
            pools.rows.forEach((pool, index) => {
                console.log(`   ${index + 1}. ${pool.token0_symbol}/${pool.token1_symbol} on ${pool.dex}`);
                console.log(`      💧 $${parseFloat(pool.liquidity_usd).toLocaleString()}`);
                console.log(`      📍 ${pool.address}`);
            });
            
        } else {
            console.log('❌ No pools returned even with working query.');
        }
        
    } catch (error) {
        console.error('❌ Simplified pool loading failed:', error.message);
    }
    
    await db.end();
    console.log('\n🏁 Debugging complete!');
}

debugPoolLoading().catch(console.error); 