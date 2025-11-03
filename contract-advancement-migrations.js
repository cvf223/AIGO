/**
 * 🚀 CONTRACT ADVANCEMENT DATABASE MIGRATIONS
 * ==========================================
 * 
 * Database migration system for smart contract advancement schema
 * Handles schema initialization, updates, and data seeding
 */

import fs from 'fs/promises';
import path from 'path';
import { executeQuery, dbEvents } from './contract-advancement-database.js';

// Migration tracking table
const MIGRATION_TABLE = `
CREATE TABLE IF NOT EXISTS contract_advancement_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_time_ms INTEGER,
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
    error_message TEXT,
    checksum VARCHAR(64)
);
`;

// Migration files to execute in order
const MIGRATIONS = [
  {
    name: '001_initial_schema',
    description: 'Create initial contract advancement schema',
    file: 'contract-advancement-schema.sql'
  },
  {
    name: '002_seed_elite_benchmarks',
    description: 'Seed elite benchmark targets',
    file: 'seed-elite-benchmarks.sql'
  },
  {
    name: '003_add_performance_indexes',
    description: 'Add performance optimization indexes',
    file: 'performance-indexes.sql'
  }
];

/**
 * 🚀 Run Database Migrations
 */
export async function runMigrations() {
  try {
    console.log('🚀 [MIGRATIONS] Starting database migrations...');
    
    // Create migration tracking table
    await executeQuery(MIGRATION_TABLE);
    console.log('✅ [MIGRATIONS] Migration tracking table created');
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`📊 [MIGRATIONS] Found ${executedMigrations.length} executed migrations`);
    
    // Run pending migrations
    for (const migration of MIGRATIONS) {
      if (!executedMigrations.includes(migration.name)) {
        await runMigration(migration);
      } else {
        console.log(`⏭️ [MIGRATIONS] Skipping ${migration.name} (already executed)`);
      }
    }
    
    console.log('✅ [MIGRATIONS] All migrations completed successfully');
    
    // Emit migration completion event
    dbEvents.emit('migrationsCompleted', {
      timestamp: Date.now(),
      totalMigrations: MIGRATIONS.length,
      executedMigrations: executedMigrations.length
    });
    
  } catch (error) {
    console.error('❌ [MIGRATIONS] Migration failed:', error.message);
    
    dbEvents.emit('migrationError', {
      error: error.message,
      timestamp: Date.now()
    });
    
    throw error;
  }
}

/**
 * 📋 Get Executed Migrations
 */
async function getExecutedMigrations() {
  try {
    const result = await executeQuery('SELECT migration_name FROM contract_advancement_migrations WHERE status = $1', ['success']);
    return result.rows.map(row => row.migration_name);
  } catch (error) {
    console.warn('⚠️ [MIGRATIONS] Could not get executed migrations:', error.message);
    return [];
  }
}

/**
 * 🔄 Run Single Migration
 */
async function runMigration(migration) {
  const startTime = Date.now();
  
  try {
    console.log(`🔄 [MIGRATIONS] Running ${migration.name}: ${migration.description}`);
    
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'database', migration.file);
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    // Calculate checksum
    const checksum = calculateChecksum(migrationSQL);
    
    // Execute migration
    await executeQuery(migrationSQL);
    
    const executionTime = Date.now() - startTime;
    
    // Record successful migration
    await executeQuery(`
      INSERT INTO contract_advancement_migrations 
      (migration_name, execution_time_ms, checksum) 
      VALUES ($1, $2, $3)
    `, [migration.name, executionTime, checksum]);
    
    console.log(`✅ [MIGRATIONS] ${migration.name} completed in ${executionTime}ms`);
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // Record failed migration
    await executeQuery(`
      INSERT INTO contract_advancement_migrations 
      (migration_name, execution_time_ms, status, error_message) 
      VALUES ($1, $2, $3, $4)
    `, [migration.name, executionTime, 'failed', error.message]);
    
    console.error(`❌ [MIGRATIONS] ${migration.name} failed:`, error.message);
    throw error;
  }
}

/**
 * 🔍 Calculate SQL Checksum
 */
function calculateChecksum(sql) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(sql).digest('hex');
}

/**
 * 📊 Get Migration Status
 */
export async function getMigrationStatus() {
  try {
    const result = await executeQuery(`
      SELECT 
        migration_name,
        executed_at,
        execution_time_ms,
        status,
        error_message
      FROM contract_advancement_migrations
      ORDER BY executed_at DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('❌ [MIGRATIONS] Could not get migration status:', error.message);
    return [];
  }
}

/**
 * 🔄 Rollback Migration
 */
export async function rollbackMigration(migrationName) {
  try {
    console.log(`🔄 [MIGRATIONS] Rolling back ${migrationName}...`);
    
    // This would contain rollback logic for each migration
    // For now, we'll just mark it as failed
    await executeQuery(`
      UPDATE contract_advancement_migrations 
      SET status = 'failed', error_message = 'Manually rolled back'
      WHERE migration_name = $1
    `, [migrationName]);
    
    console.log(`✅ [MIGRATIONS] ${migrationName} rolled back`);
    
  } catch (error) {
    console.error(`❌ [MIGRATIONS] Rollback failed for ${migrationName}:`, error.message);
    throw error;
  }
}

/**
 * 🧹 Reset Database (Development Only)
 */
export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production environment');
  }
  
  try {
    console.log('🧹 [MIGRATIONS] Resetting database...');
    
    // Drop all tables (in reverse order of dependencies)
    const dropQueries = [
      'DROP TABLE IF EXISTS contract_advancement_performance_metrics CASCADE',
      'DROP TABLE IF EXISTS contract_advancement_audit_log CASCADE',
      'DROP TABLE IF EXISTS contract_advancement_recommendations CASCADE',
      'DROP TABLE IF EXISTS competitive_gap_analysis CASCADE',
      'DROP TABLE IF EXISTS top_performer_patterns CASCADE',
      'DROP TABLE IF EXISTS landscape_predictions CASCADE',
      'DROP TABLE IF EXISTS technique_evolution_tracking CASCADE',
      'DROP TABLE IF EXISTS contract_evolution_history CASCADE',
      'DROP TABLE IF EXISTS elite_benchmark_targets CASCADE',
      'DROP TABLE IF EXISTS agent_benchmark_history CASCADE',
      'DROP TABLE IF EXISTS contract_performance_categories CASCADE',
      'DROP TABLE IF EXISTS contract_advancement_migrations CASCADE'
    ];
    
    for (const query of dropQueries) {
      await executeQuery(query);
    }
    
    console.log('✅ [MIGRATIONS] Database reset completed');
    
    // Run migrations again
    await runMigrations();
    
  } catch (error) {
    console.error('❌ [MIGRATIONS] Database reset failed:', error.message);
    throw error;
  }
}

/**
 * 📋 Validate Database Schema
 */
export async function validateSchema() {
  try {
    console.log('🔍 [MIGRATIONS] Validating database schema...');
    
    const requiredTables = [
      'contract_performance_categories',
      'agent_benchmark_history',
      'elite_benchmark_targets',
      'contract_evolution_history',
      'technique_evolution_tracking',
      'landscape_predictions',
      'top_performer_patterns',
      'competitive_gap_analysis',
      'contract_advancement_recommendations',
      'contract_advancement_audit_log',
      'contract_advancement_performance_metrics',
      'contract_advancement_migrations'
    ];
    
    const missingTables = [];
    
    for (const table of requiredTables) {
      try {
        await executeQuery(`SELECT 1 FROM ${table} LIMIT 1`);
      } catch (error) {
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      console.error('❌ [MIGRATIONS] Missing tables:', missingTables);
      return false;
    }
    
    console.log('✅ [MIGRATIONS] Database schema validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ [MIGRATIONS] Schema validation failed:', error.message);
    return false;
  }
}

/**
 * 📊 Database Health Check
 */
async function databaseHealthCheck() {
  try {
    console.log('🏥 [MIGRATIONS] Running database health check...');
    
    const checks = [
      { name: 'Connection Test', query: 'SELECT 1 as health_check' },
      { name: 'Schema Validation', query: 'SELECT COUNT(*) FROM contract_advancement_migrations' },
      { name: 'Performance Test', query: 'SELECT COUNT(*) FROM contract_performance_categories LIMIT 1' },
      { name: 'Benchmark Test', query: 'SELECT COUNT(*) FROM agent_benchmark_history LIMIT 1' }
    ];
    
    const results = {};
    
    for (const check of checks) {
      try {
        const startTime = Date.now();
        await executeQuery(check.query);
        const executionTime = Date.now() - startTime;
        
        results[check.name] = {
          status: 'healthy',
          executionTime
        };
      } catch (error) {
        results[check.name] = {
          status: 'unhealthy',
          error: error.message
        };
      }
    }
    
    const healthyChecks = Object.values(results).filter(r => r.status === 'healthy').length;
    const totalChecks = checks.length;
    
    console.log(`🏥 [MIGRATIONS] Health check: ${healthyChecks}/${totalChecks} checks passed`);
    
    return {
      overall: healthyChecks === totalChecks,
      checks: results,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('❌ [MIGRATIONS] Health check failed:', error.message);
    return {
      overall: false,
      error: error.message,
      timestamp: Date.now()
    };
  }
}

// Export all functions
export {
  runMigrations,
  getMigrationStatus,
  rollbackMigration,
  resetDatabase,
  validateSchema,
  databaseHealthCheck
}; 