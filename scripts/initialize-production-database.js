#!/usr/bin/env node

/**
 * 🗄️ PRODUCTION DATABASE INITIALIZATION
 * ======================================
 * 
 * Creates all required tables for the Construction AI Syndicate
 * with proper schema and indexes for 896GB production server.
 */

import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
dotenv.config();

// Import database connection manager
import dbConnectionManager from '../src/database/DatabaseConnectionManager.js';

async function initializeDatabase() {
    console.log('🗄️ PRODUCTION DATABASE INITIALIZATION');
    console.log('=====================================\n');
    
    try {
        // Get database connection
        console.log('📡 Connecting to database...');
        await dbConnectionManager.initialize();
        const pool = await dbConnectionManager.getPool();
        
        if (!pool) {
            throw new Error('Failed to establish database connection');
        }
        
        console.log('✅ Database connected\n');
        
        // Read SQL schema file
        const schemaPath = path.join(__dirname, '..', 'database', 'create-all-tables.sql');
        
        if (!fs.existsSync(schemaPath)) {
            console.log('   ⚠️ Schema file not found, creating tables programmatically...');
            await createTablesDirectly(pool);
        } else {
            console.log('📄 Reading schema from create-all-tables.sql...');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            console.log('🔨 Creating tables...');
            await pool.query(schema);
            console.log('✅ Tables created from SQL file\n');
        }
        
        // Create additional indexes for performance
        console.log('📊 Creating performance indexes...');
        await createIndexes(pool);
        
        // Seed initial data if requested
        if (process.argv.includes('--seed')) {
            console.log('🌱 Seeding initial data...');
            await seedData(pool);
        }
        
        // Show final statistics
        const stats = dbConnectionManager.getStats();
        console.log('\n📊 Database Statistics:');
        console.log(`   Total connections: ${stats.totalConnections}`);
        console.log(`   Idle connections: ${stats.idleConnections}`);
        console.log(`   Registered systems: ${stats.registeredSystems}`);
        
        console.log('\n✅ Database initialization complete!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.error('   Stack:', error.stack);
        process.exit(1);
    } finally {
        await dbConnectionManager.shutdown();
    }
}

async function createTablesDirectly(pool) {
    const tables = [
        // Agent performance table
        `CREATE TABLE IF NOT EXISTS agent_performance (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            agent_id VARCHAR(255) NOT NULL,
            task_type VARCHAR(100),
            success_rate FLOAT DEFAULT 0,
            avg_completion_time INTEGER,
            total_tasks INTEGER DEFAULT 0,
            last_updated TIMESTAMPTZ DEFAULT NOW(),
            metadata JSONB DEFAULT '{}'::jsonb
        )`,
        
        // Knowledge graph nodes
        `CREATE TABLE IF NOT EXISTS kg_nodes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            node_id VARCHAR(255) UNIQUE NOT NULL,
            node_type VARCHAR(100) NOT NULL,
            properties JSONB NOT NULL DEFAULT '{}'::jsonb,
            embedding_data BYTEA,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        
        // Knowledge graph edges
        `CREATE TABLE IF NOT EXISTS kg_edges (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            source_id VARCHAR(255) NOT NULL,
            target_id VARCHAR(255) NOT NULL,
            edge_type VARCHAR(100) NOT NULL,
            weight FLOAT DEFAULT 1.0,
            properties JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        
        // Agent action history
        `CREATE TABLE IF NOT EXISTS agent_action_history (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            agent_id VARCHAR(255) NOT NULL,
            action_type VARCHAR(100),
            action_data JSONB,
            result JSONB,
            timestamp TIMESTAMPTZ DEFAULT NOW()
        )`,
        
        // Construction historical data
        `CREATE TABLE IF NOT EXISTS construction_historical_data (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_type VARCHAR(100),
            location VARCHAR(255),
            cost_per_sqm DECIMAL(10,2),
            material_costs JSONB,
            labor_costs JSONB,
            completion_time_days INTEGER,
            quality_score FLOAT,
            recorded_date DATE,
            metadata JSONB DEFAULT '{}'::jsonb
        )`,
        
        // Construction price forecasts
        `CREATE TABLE IF NOT EXISTS construction_price_forecasts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            material_type VARCHAR(100),
            region VARCHAR(100),
            forecast_date DATE,
            predicted_price DECIMAL(10,2),
            confidence_score FLOAT,
            model_version VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        
        // System state for persistence
        `CREATE TABLE IF NOT EXISTS system_state (
            id VARCHAR(255) PRIMARY KEY,
            state_data JSONB NOT NULL,
            version INTEGER DEFAULT 1,
            last_updated TIMESTAMPTZ DEFAULT NOW()
        )`,
        
        // Shared memory for agents
        `CREATE TABLE IF NOT EXISTS shared_memory (
            key VARCHAR(255) PRIMARY KEY,
            value JSONB NOT NULL,
            metadata JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ
        )`,
        
        // Task queue for background processing
        `CREATE TABLE IF NOT EXISTS task_queue (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            task_type VARCHAR(100) NOT NULL,
            priority INTEGER DEFAULT 5,
            payload JSONB NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            attempts INTEGER DEFAULT 0,
            max_attempts INTEGER DEFAULT 3,
            error_message TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            started_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ
        )`
    ];
    
    for (const table of tables) {
        try {
            await pool.query(table);
            const tableName = table.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
            console.log(`   ✅ Table created: ${tableName}`);
        } catch (error) {
            console.error(`   ❌ Failed to create table:`, error.message);
        }
    }
}

async function createIndexes(pool) {
    const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON agent_performance(agent_id)',
        'CREATE INDEX IF NOT EXISTS idx_kg_edges_source ON kg_edges(source_id)',
        'CREATE INDEX IF NOT EXISTS idx_kg_edges_target ON kg_edges(target_id)',
        'CREATE INDEX IF NOT EXISTS idx_agent_action_history_agent ON agent_action_history(agent_id)',
        'CREATE INDEX IF NOT EXISTS idx_agent_action_history_timestamp ON agent_action_history(timestamp DESC)',
        'CREATE INDEX IF NOT EXISTS idx_construction_historical_project ON construction_historical_data(project_type)',
        'CREATE INDEX IF NOT EXISTS idx_construction_forecasts_material ON construction_price_forecasts(material_type)',
        'CREATE INDEX IF NOT EXISTS idx_shared_memory_expires ON shared_memory(expires_at) WHERE expires_at IS NOT NULL',
        'CREATE INDEX IF NOT EXISTS idx_task_queue_status ON task_queue(status, priority DESC)'
    ];
    
    for (const index of indexes) {
        try {
            await pool.query(index);
            const indexName = index.match(/CREATE INDEX IF NOT EXISTS (\w+)/)[1];
            console.log(`   ✅ Index created: ${indexName}`);
        } catch (error) {
            console.warn(`   ⚠️ Index creation warning:`, error.message);
        }
    }
}

async function seedData(pool) {
    // Seed some initial construction data
    const seedQueries = [
        `INSERT INTO construction_historical_data 
         (project_type, location, cost_per_sqm, completion_time_days, quality_score, recorded_date)
         VALUES 
         ('residential', 'Berlin', 2500.00, 365, 0.92, '2024-01-15'),
         ('commercial', 'Munich', 3200.00, 450, 0.95, '2024-02-20'),
         ('industrial', 'Hamburg', 1800.00, 280, 0.88, '2024-03-10')
         ON CONFLICT DO NOTHING`,
        
        `INSERT INTO system_state (id, state_data)
         VALUES ('system_initialized', '{"version": "1.0.0", "initialized": true}'::jsonb)
         ON CONFLICT (id) DO UPDATE SET state_data = EXCLUDED.state_data`
    ];
    
    for (const query of seedQueries) {
        try {
            await pool.query(query);
            console.log('   ✅ Seed data inserted');
        } catch (error) {
            console.warn('   ⚠️ Seed data warning:', error.message);
        }
    }
}

// Run initialization
initializeDatabase().catch(console.error);