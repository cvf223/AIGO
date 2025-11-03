/**
 * 🗄️ DATABASE MIGRATION SYSTEM
 * ===========================
 * Production-grade migration system for managing database schema versions
 * 
 * Features:
 * - Version tracking
 * - Up/down migrations
 * - Transaction safety
 * - Rollback capabilities
 * - Schema validation
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseMigrationSystem {
    constructor(databaseConfig) {
        this.pool = new pg.Pool(databaseConfig);
        this.migrationsPath = path.join(__dirname, 'versions');
        this.initialized = false;
    }

    /**
     * Initialize migration system - create migrations table
     */
    async initialize() {
        const client = await this.pool.connect();
        
        try {
            // Create migrations tracking table
            await client.query(`
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version VARCHAR(20) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    applied_at TIMESTAMPTZ DEFAULT NOW(),
                    execution_time_ms INTEGER,
                    checksum VARCHAR(64),
                    rollback_sql TEXT
                );
            `);
            
            // Create migration history table
            await client.query(`
                CREATE TABLE IF NOT EXISTS migration_history (
                    id SERIAL PRIMARY KEY,
                    version VARCHAR(20) NOT NULL,
                    direction VARCHAR(10) NOT NULL CHECK (direction IN ('up', 'down')),
                    started_at TIMESTAMPTZ DEFAULT NOW(),
                    completed_at TIMESTAMPTZ,
                    status VARCHAR(20) DEFAULT 'running',
                    error_message TEXT,
                    executed_by VARCHAR(100) DEFAULT CURRENT_USER
                );
            `);
            
            this.initialized = true;
            console.log('✅ Migration system initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize migration system:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get all migration files from the versions directory
     */
    async getMigrationFiles() {
        try {
            const files = await fs.readdir(this.migrationsPath);
            return files
                .filter(f => f.endsWith('.sql'))
                .sort(); // Ensure chronological order
        } catch (error) {
            // Directory doesn't exist yet
            return [];
        }
    }

    /**
     * Get applied migrations from database
     */
    async getAppliedMigrations() {
        const result = await this.pool.query(`
            SELECT version, name, applied_at, execution_time_ms 
            FROM schema_migrations 
            ORDER BY version
        `);
        return result.rows;
    }

    /**
     * Get pending migrations
     */
    async getPendingMigrations() {
        const migrationFiles = await this.getMigrationFiles();
        const appliedMigrations = await this.getAppliedMigrations();
        const appliedVersions = new Set(appliedMigrations.map(m => m.version));
        
        return migrationFiles.filter(file => {
            const version = this.extractVersion(file);
            return !appliedVersions.has(version);
        });
    }

    /**
     * Extract version from migration filename
     * Format: 001_initial_schema.sql
     */
    extractVersion(filename) {
        const match = filename.match(/^(\d{3})_/);
        return match ? match[1] : null;
    }

    /**
     * Extract migration name from filename
     */
    extractName(filename) {
        const match = filename.match(/^\d{3}_(.+)\.sql$/);
        return match ? match[1].replace(/_/g, ' ') : filename;
    }

    /**
     * Calculate checksum for migration file
     */
    async calculateChecksum(content) {
        const crypto = await import('crypto');
        return crypto.default
            .createHash('sha256')
            .update(content)
            .digest('hex');
    }

    /**
     * Apply a single migration
     */
    async applyMigration(filename) {
        const version = this.extractVersion(filename);
        const name = this.extractName(filename);
        const filepath = path.join(this.migrationsPath, filename);
        
        console.log(`📦 Applying migration ${version}: ${name}`);
        
        const client = await this.pool.connect();
        const startTime = Date.now();
        let historyId;
        
        try {
            // Start transaction
            await client.query('BEGIN');
            
            // Record migration start
            const historyResult = await client.query(`
                INSERT INTO migration_history (version, direction)
                VALUES ($1, 'up')
                RETURNING id
            `, [version]);
            historyId = historyResult.rows[0].id;
            
            // Read migration file
            const content = await fs.readFile(filepath, 'utf8');
            const checksum = await this.calculateChecksum(content);
            
            // Split content into UP and DOWN sections
            const sections = this.parseMigrationSections(content);
            
            // Execute UP migration
            await client.query(sections.up);
            
            // Record successful migration
            const executionTime = Date.now() - startTime;
            await client.query(`
                INSERT INTO schema_migrations (version, name, checksum, rollback_sql, execution_time_ms)
                VALUES ($1, $2, $3, $4, $5)
            `, [version, name, checksum, sections.down, executionTime]);
            
            // Update history
            await client.query(`
                UPDATE migration_history 
                SET completed_at = NOW(), status = 'success'
                WHERE id = $1
            `, [historyId]);
            
            // Commit transaction
            await client.query('COMMIT');
            
            console.log(`✅ Migration ${version} applied successfully (${executionTime}ms)`);
            
        } catch (error) {
            // Rollback transaction
            await client.query('ROLLBACK');
            
            // Update history with error
            if (historyId) {
                await client.query(`
                    UPDATE migration_history 
                    SET completed_at = NOW(), status = 'failed', error_message = $2
                    WHERE id = $1
                `, [historyId, error.message]);
            }
            
            console.error(`❌ Migration ${version} failed:`, error.message);
            throw error;
            
        } finally {
            client.release();
        }
    }

    /**
     * Parse migration file into UP and DOWN sections
     */
    parseMigrationSections(content) {
        const upMatch = content.match(/-- UP\n([\s\S]*?)(?=-- DOWN|$)/);
        const downMatch = content.match(/-- DOWN\n([\s\S]*?)$/);
        
        return {
            up: upMatch ? upMatch[1].trim() : content,
            down: downMatch ? downMatch[1].trim() : ''
        };
    }

    /**
     * Rollback a specific migration
     */
    async rollbackMigration(version) {
        console.log(`🔄 Rolling back migration ${version}`);
        
        const client = await this.pool.connect();
        const startTime = Date.now();
        let historyId;
        
        try {
            // Get migration info
            const result = await client.query(`
                SELECT name, rollback_sql 
                FROM schema_migrations 
                WHERE version = $1
            `, [version]);
            
            if (result.rows.length === 0) {
                throw new Error(`Migration ${version} not found in applied migrations`);
            }
            
            const { name, rollback_sql } = result.rows[0];
            
            if (!rollback_sql) {
                throw new Error(`No rollback SQL defined for migration ${version}`);
            }
            
            // Start transaction
            await client.query('BEGIN');
            
            // Record rollback start
            const historyResult = await client.query(`
                INSERT INTO migration_history (version, direction)
                VALUES ($1, 'down')
                RETURNING id
            `, [version]);
            historyId = historyResult.rows[0].id;
            
            // Execute rollback
            await client.query(rollback_sql);
            
            // Remove migration record
            await client.query(`
                DELETE FROM schema_migrations WHERE version = $1
            `, [version]);
            
            // Update history
            const executionTime = Date.now() - startTime;
            await client.query(`
                UPDATE migration_history 
                SET completed_at = NOW(), status = 'success'
                WHERE id = $1
            `, [historyId]);
            
            // Commit transaction
            await client.query('COMMIT');
            
            console.log(`✅ Migration ${version} rolled back successfully (${executionTime}ms)`);
            
        } catch (error) {
            // Rollback transaction
            await client.query('ROLLBACK');
            
            // Update history with error
            if (historyId) {
                await client.query(`
                    UPDATE migration_history 
                    SET completed_at = NOW(), status = 'failed', error_message = $2
                    WHERE id = $1
                `, [historyId, error.message]);
            }
            
            console.error(`❌ Rollback of migration ${version} failed:`, error.message);
            throw error;
            
        } finally {
            client.release();
        }
    }

    /**
     * Run all pending migrations
     */
    async migrate() {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const pending = await this.getPendingMigrations();
        
        if (pending.length === 0) {
            console.log('✅ Database is up to date - no pending migrations');
            return;
        }
        
        console.log(`📦 Found ${pending.length} pending migrations`);
        
        for (const migration of pending) {
            await this.applyMigration(migration);
        }
        
        console.log('✅ All migrations completed successfully');
    }

    /**
     * Rollback to a specific version
     */
    async rollbackTo(targetVersion) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const applied = await this.getAppliedMigrations();
        const toRollback = applied
            .filter(m => m.version > targetVersion)
            .reverse(); // Rollback in reverse order
        
        if (toRollback.length === 0) {
            console.log(`✅ Already at version ${targetVersion} or earlier`);
            return;
        }
        
        console.log(`🔄 Rolling back ${toRollback.length} migrations`);
        
        for (const migration of toRollback) {
            await this.rollbackMigration(migration.version);
        }
        
        console.log(`✅ Rolled back to version ${targetVersion}`);
    }

    /**
     * Get migration status
     */
    async status() {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const applied = await this.getAppliedMigrations();
        const pending = await this.getPendingMigrations();
        
        console.log('\n📊 Migration Status:');
        console.log('==================');
        
        if (applied.length > 0) {
            console.log('\n✅ Applied Migrations:');
            for (const migration of applied) {
                console.log(`   ${migration.version} - ${migration.name} (${new Date(migration.applied_at).toLocaleString()})`);
            }
        } else {
            console.log('\n⚠️  No migrations applied yet');
        }
        
        if (pending.length > 0) {
            console.log('\n⏳ Pending Migrations:');
            for (const migration of pending) {
                const version = this.extractVersion(migration);
                const name = this.extractName(migration);
                console.log(`   ${version} - ${name}`);
            }
        } else {
            console.log('\n✅ No pending migrations');
        }
        
        console.log('\n');
        
        return { applied, pending };
    }

    /**
     * Create a new migration file
     */
    async createMigration(name) {
        // Ensure migrations directory exists
        await fs.mkdir(this.migrationsPath, { recursive: true });
        
        // Get next version number
        const files = await this.getMigrationFiles();
        const lastVersion = files.length > 0 
            ? parseInt(this.extractVersion(files[files.length - 1]))
            : 0;
        const nextVersion = String(lastVersion + 1).padStart(3, '0');
        
        // Create filename
        const filename = `${nextVersion}_${name.toLowerCase().replace(/\s+/g, '_')}.sql`;
        const filepath = path.join(this.migrationsPath, filename);
        
        // Create template
        const template = `-- ============================================================================
-- Migration: ${name}
-- Version: ${nextVersion}
-- Created: ${new Date().toISOString()}
-- ============================================================================

-- UP
-- Add your schema changes here


-- DOWN
-- Add rollback statements here

`;
        
        await fs.writeFile(filepath, template);
        
        console.log(`✅ Created migration: ${filename}`);
        return filepath;
    }

    /**
     * Validate database schema against expected state
     */
    async validateSchema() {
        console.log('🔍 Validating database schema...');
        
        const client = await this.pool.connect();
        
        try {
            // Check critical tables exist
            const criticalTables = [
                'syndicate_agents',
                'arbitrage_opportunities',
                'arbitrage_executions',
                'agent_memory',
                'pool_prices',
                'quantum_graph_state',
                'world_model_predictions'
            ];
            
            const missingTables = [];
            
            for (const table of criticalTables) {
                const result = await client.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = $1
                    )
                `, [table]);
                
                if (!result.rows[0].exists) {
                    missingTables.push(table);
                }
            }
            
            if (missingTables.length > 0) {
                console.error('❌ Missing critical tables:', missingTables);
                return false;
            }
            
            console.log('✅ Schema validation passed');
            return true;
            
        } finally {
            client.release();
        }
    }

    /**
     * Close database connection pool
     */
    async close() {
        await this.pool.end();
    }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];
    const args = process.argv.slice(3);
    
    // Load database config from environment or use defaults
    const dbConfig = {
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arbitrage_syndicate',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    };
    
    const migrator = new DatabaseMigrationSystem(dbConfig);
    
    const runCommand = async () => {
        try {
            switch (command) {
                case 'migrate':
                    await migrator.migrate();
                    break;
                    
                case 'rollback':
                    const version = args[0];
                    if (!version) {
                        console.error('❌ Please specify target version for rollback');
                        process.exit(1);
                    }
                    await migrator.rollbackTo(version);
                    break;
                    
                case 'status':
                    await migrator.status();
                    break;
                    
                case 'create':
                    const name = args.join(' ');
                    if (!name) {
                        console.error('❌ Please provide a migration name');
                        process.exit(1);
                    }
                    await migrator.createMigration(name);
                    break;
                    
                case 'validate':
                    const isValid = await migrator.validateSchema();
                    process.exit(isValid ? 0 : 1);
                    break;
                    
                default:
                    console.log(`
🗄️  Database Migration System

Usage:
  node migration-system.js <command> [args]

Commands:
  migrate              Run all pending migrations
  rollback <version>   Rollback to specific version
  status              Show migration status
  create <name>       Create new migration file
  validate            Validate database schema

Examples:
  node migration-system.js migrate
  node migration-system.js rollback 001
  node migration-system.js create "add quantum states table"
                    `);
                    process.exit(0);
            }
            
            await migrator.close();
            process.exit(0);
            
        } catch (error) {
            console.error('❌ Command failed:', error);
            await migrator.close();
            process.exit(1);
        }
    };
    
    runCommand();
}
