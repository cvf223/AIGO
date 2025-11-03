#!/usr/bin/env node

/**
 * 🗄️ DATABASE MIGRATION RUNNER
 * ===========================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Production-grade migration system
 * 
 * FEATURES:
 * - Sequential migration execution
 * - Migration history tracking
 * - Rollback support
 * - Transaction safety
 * - Detailed logging
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

export class DatabaseMigrator {
    constructor(config = {}) {
        this.config = {
            connectionString: config.connectionString || process.env.DATABASE_URL,
            migrationsDir: config.migrationsDir || __dirname,
            migrationsTable: config.migrationsTable || 'migrations',
            ...config
        };
        
        this.pool = null;
        this.isInitialized = false;
    }
    
    /**
     * 🚀 INITIALIZE
     */
    async initialize() {
        console.log('🗄️ Initializing Database Migrator...');
        
        // Create connection pool
        this.pool = new pg.Pool({
            connectionString: this.config.connectionString,
            max: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000
        });
        
        // Test connection
        try {
            const client = await this.pool.connect();
            console.log('✅ Database connection established');
            client.release();
        } catch (error) {
            console.error('❌ Failed to connect to database:', error.message);
            throw error;
        }
        
        // Create migrations table if not exists
        await this.createMigrationsTable();
        
        this.isInitialized = true;
        console.log('✅ Database Migrator initialized');
    }
    
    /**
     * 📋 CREATE MIGRATIONS TABLE
     */
    async createMigrationsTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS ${this.config.migrationsTable} (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                checksum VARCHAR(64) NOT NULL,
                execution_time_ms INTEGER,
                success BOOLEAN DEFAULT true,
                error_message TEXT
            );
        `;
        
        await this.pool.query(query);
        console.log(`✅ Migrations table '${this.config.migrationsTable}' ready`);
    }
    
    /**
     * 🔍 GET PENDING MIGRATIONS
     */
    async getPendingMigrations() {
        // Get applied migrations
        const result = await this.pool.query(
            `SELECT filename FROM ${this.config.migrationsTable} WHERE success = true ORDER BY filename`
        );
        const appliedMigrations = new Set(result.rows.map(row => row.filename));
        
        // Get all migration files
        const files = await fs.readdir(this.config.migrationsDir);
        const migrationFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort();
        
        // Find pending migrations
        const pendingMigrations = migrationFiles.filter(file => !appliedMigrations.has(file));
        
        return pendingMigrations;
    }
    
    /**
     * 🚀 RUN MIGRATIONS
     */
    async runMigrations() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        console.log('\n🔄 Checking for pending migrations...');
        
        const pendingMigrations = await this.getPendingMigrations();
        
        if (pendingMigrations.length === 0) {
            console.log('✅ Database is up to date! No migrations to run.');
            return { success: true, migrationsRun: 0 };
        }
        
        console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
        pendingMigrations.forEach(m => console.log(`   - ${m}`));
        
        let successCount = 0;
        const errors = [];
        
        for (const migration of pendingMigrations) {
            try {
                await this.runSingleMigration(migration);
                successCount++;
            } catch (error) {
                errors.push({ migration, error: error.message });
                console.error(`❌ Migration ${migration} failed. Stopping migrations.`);
                break; // Stop on first error
            }
        }
        
        console.log(`\n✅ Successfully ran ${successCount} migrations`);
        
        if (errors.length > 0) {
            console.error(`❌ ${errors.length} migrations failed`);
            return { success: false, migrationsRun: successCount, errors };
        }
        
        return { success: true, migrationsRun: successCount };
    }
    
    /**
     * 📄 RUN SINGLE MIGRATION
     */
    async runSingleMigration(filename) {
        console.log(`\n🔄 Running migration: ${filename}`);
        
        const filepath = path.join(this.config.migrationsDir, filename);
        const sql = await fs.readFile(filepath, 'utf8');
        const checksum = this.calculateChecksum(sql);
        
        const startTime = Date.now();
        const client = await this.pool.connect();
        
        try {
            // Begin transaction
            await client.query('BEGIN');
            
            // Run migration
            await client.query(sql);
            
            // Record migration
            await client.query(
                `INSERT INTO ${this.config.migrationsTable} (filename, checksum, execution_time_ms, success) VALUES ($1, $2, $3, $4)`,
                [filename, checksum, Date.now() - startTime, true]
            );
            
            // Commit transaction
            await client.query('COMMIT');
            
            console.log(`✅ Migration ${filename} completed in ${Date.now() - startTime}ms`);
            
        } catch (error) {
            // Rollback transaction
            await client.query('ROLLBACK');
            
            // Record failed migration
            await client.query(
                `INSERT INTO ${this.config.migrationsTable} (filename, checksum, execution_time_ms, success, error_message) VALUES ($1, $2, $3, $4, $5)`,
                [filename, checksum, Date.now() - startTime, false, error.message]
            );
            
            console.error(`❌ Migration ${filename} failed:`, error.message);
            throw error;
            
        } finally {
            client.release();
        }
    }
    
    /**
     * 🔐 CALCULATE CHECKSUM
     */
    calculateChecksum(content) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(content).digest('hex');
    }
    
    /**
     * 📊 GET MIGRATION STATUS
     */
    async getMigrationStatus() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const result = await this.pool.query(`
            SELECT 
                filename,
                applied_at,
                execution_time_ms,
                success,
                error_message
            FROM ${this.config.migrationsTable}
            ORDER BY applied_at DESC
        `);
        
        return result.rows;
    }
    
    /**
     * 🗑️ CLEANUP
     */
    async cleanup() {
        if (this.pool) {
            await this.pool.end();
            console.log('✅ Database connections closed');
        }
    }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    const migrator = new DatabaseMigrator();
    
    try {
        await migrator.initialize();
        
        const command = process.argv[2] || 'migrate';
        
        switch (command) {
            case 'migrate':
                const result = await migrator.runMigrations();
                process.exit(result.success ? 0 : 1);
                break;
                
            case 'status':
                const status = await migrator.getMigrationStatus();
                console.log('\n📊 Migration Status:');
                console.table(status);
                process.exit(0);
                break;
                
            default:
                console.error(`Unknown command: ${command}`);
                console.log('Usage: node migrate.js [migrate|status]');
                process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await migrator.cleanup();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default DatabaseMigrator;
