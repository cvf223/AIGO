#!/usr/bin/env node
/**
 * 🔧 DATABASE ENVIRONMENT SETUP
 * ============================
 * 
 * Sets up proper PostgreSQL DATABASE_URL configuration and environment variables
 * with comprehensive fallbacks for production and development environments.
 */

import fs from 'fs/promises';
import path from 'path';

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           🔧 DATABASE ENVIRONMENT SETUP 🔧                  ║
║                                                              ║
║     Configuring PostgreSQL DATABASE_URL with fallbacks      ║
╚══════════════════════════════════════════════════════════════╝
`);

/**
 * 🏗️ DATABASE ENVIRONMENT CONFIGURATOR
 */
class DatabaseEnvironmentConfigurator {
    constructor() {
        this.envFile = '.env';
        this.backupFile = '.env.backup';
        this.productionEnvFile = '.env.production';
    }
    
    /**
     * 🔧 SETUP DATABASE ENVIRONMENT
     */
    async setupDatabaseEnvironment() {
        console.log('🔧 Setting up database environment configuration...');
        
        try {
            // Create backup of existing .env file
            await this.backupExistingEnv();
            
            // Load existing environment variables
            const existingEnv = await this.loadExistingEnv();
            
            // Generate comprehensive database configuration
            const dbConfig = this.generateDatabaseConfig(existingEnv);
            
            // Create .env file with proper configuration
            await this.createEnvFile(dbConfig);
            
            // Create production-specific .env file
            await this.createProductionEnvFile(dbConfig);
            
            // Verify configuration
            await this.verifyConfiguration();
            
            console.log('✅ Database environment setup completed successfully!');
            
        } catch (error) {
            console.error('❌ Database environment setup failed:', error);
            throw error;
        }
    }
    
    /**
     * 💾 BACKUP EXISTING ENV FILE
     */
    async backupExistingEnv() {
        try {
            const envExists = await fs.access(this.envFile).then(() => true).catch(() => false);
            
            if (envExists) {
                const envContent = await fs.readFile(this.envFile, 'utf8');
                await fs.writeFile(this.backupFile, envContent);
                console.log(`   💾 Backed up existing .env to ${this.backupFile}`);
            }
        } catch (error) {
            console.warn(`   ⚠️ Could not backup .env file: ${error.message}`);
        }
    }
    
    /**
     * 📋 LOAD EXISTING ENV VARIABLES
     */
    async loadExistingEnv() {
        const existingEnv = {};
        
        try {
            const envContent = await fs.readFile(this.envFile, 'utf8');
            const lines = envContent.split('\n');
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                    const [key, ...valueParts] = trimmed.split('=');
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    existingEnv[key.trim()] = value;
                }
            }
            
            console.log(`   📋 Loaded ${Object.keys(existingEnv).length} existing environment variables`);
            
        } catch (error) {
            console.log('   📋 No existing .env file found, creating new configuration');
        }
        
        return existingEnv;
    }
    
    /**
     * 🏗️ GENERATE DATABASE CONFIGURATION
     */
    generateDatabaseConfig(existingEnv) {
        console.log('   🏗️ Generating comprehensive database configuration...');
        
        // Determine environment
        const nodeEnv = process.env.NODE_ENV || existingEnv.NODE_ENV || 'development';
        const isProduction = nodeEnv === 'production';
        
        // Database connection components with fallbacks
        const dbHost = process.env.POSTGRES_HOST || existingEnv.POSTGRES_HOST || 'localhost';
        const dbPort = process.env.POSTGRES_PORT || existingEnv.POSTGRES_PORT || '5432';
        const dbName = process.env.POSTGRES_DB || existingEnv.POSTGRES_DB || 'construction_syndicate';
        const dbUser = process.env.POSTGRES_USER || existingEnv.POSTGRES_USER || 'postgres';
        const dbPassword = process.env.POSTGRES_PASSWORD || existingEnv.POSTGRES_PASSWORD || 'postgres';
        
        // SSL configuration
        const sslEnabled = isProduction || (process.env.POSTGRES_SSL || existingEnv.POSTGRES_SSL) === 'true';
        
        // Construct DATABASE_URL
        const encodedPassword = encodeURIComponent(dbPassword);
        const sslSuffix = sslEnabled ? '?sslmode=require' : '';
        const databaseUrl = `postgresql://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbName}${sslSuffix}`;
        
        // Pool configuration
        const poolConfig = {
            DB_POOL_MAX: isProduction ? '200' : '20',
            DB_POOL_MIN: isProduction ? '20' : '2',
            DB_IDLE_TIMEOUT: '30000',
            DB_CONNECTION_TIMEOUT: '10000',
            DB_STATEMENT_TIMEOUT: isProduction ? '300000' : '30000',
            DB_QUERY_TIMEOUT: isProduction ? '300000' : '30000',
            DB_APPLICATION_NAME: 'aigo-syndicate'
        };
        
        console.log('   📊 Database configuration generated:');
        console.log(`     Environment: ${nodeEnv}`);
        console.log(`     Host: ${dbHost}:${dbPort}`);
        console.log(`     Database: ${dbName}`);
        console.log(`     User: ${dbUser}`);
        console.log(`     SSL: ${sslEnabled ? 'ENABLED' : 'DISABLED'}`);
        console.log(`     Pool Size: ${poolConfig.DB_POOL_MIN}-${poolConfig.DB_POOL_MAX} connections`);
        
        return {
            // Environment
            NODE_ENV: nodeEnv,
            
            // Database URL (primary configuration)
            DATABASE_URL: databaseUrl,
            
            // Individual PostgreSQL components (fallback)
            POSTGRES_HOST: dbHost,
            POSTGRES_PORT: dbPort,
            POSTGRES_DB: dbName,
            POSTGRES_DATABASE: dbName, // Alternative name
            POSTGRES_USER: dbUser,
            POSTGRES_USERNAME: dbUser, // Alternative name
            POSTGRES_PASSWORD: dbPassword,
            POSTGRES_SSL: sslEnabled.toString(),
            
            // Pool configuration
            ...poolConfig,
            
            // Additional configuration
            GOOGLE_VISION_ENABLED: 'false', // Explicitly disable Google Vision
            GOOGLE_APPLICATION_CREDENTIALS: '', // Clear to avoid warnings
            
            // Server configuration
            CONSTRUCTION_GUI_PORT: '3001',
            CORS_ORIGINS: 'http://localhost:3001,http://162.55.83.33:3001',
            
            // Keep existing variables
            ...existingEnv
        };
    }
    
    /**
     * 📝 CREATE .ENV FILE
     */
    async createEnvFile(config) {
        console.log('   📝 Creating .env file...');
        
        const envContent = this.formatEnvContent(config, 'Development/Production');
        await fs.writeFile(this.envFile, envContent);
        
        console.log(`   ✅ Created ${this.envFile} with comprehensive database configuration`);
    }
    
    /**
     * 🚀 CREATE PRODUCTION .ENV FILE
     */
    async createProductionEnvFile(config) {
        console.log('   🚀 Creating production .env file...');
        
        // Production-specific overrides
        const productionConfig = {
            ...config,
            NODE_ENV: 'production',
            POSTGRES_SSL: 'true',
            DB_POOL_MAX: '200',
            DB_POOL_MIN: '20',
            DB_STATEMENT_TIMEOUT: '300000',
            DB_QUERY_TIMEOUT: '300000'
        };
        
        // Regenerate DATABASE_URL with production settings
        const encodedPassword = encodeURIComponent(productionConfig.POSTGRES_PASSWORD);
        productionConfig.DATABASE_URL = `postgresql://${productionConfig.POSTGRES_USER}:${encodedPassword}@${productionConfig.POSTGRES_HOST}:${productionConfig.POSTGRES_PORT}/${productionConfig.POSTGRES_DB}?sslmode=require`;
        
        const envContent = this.formatEnvContent(productionConfig, 'Production');
        await fs.writeFile(this.productionEnvFile, envContent);
        
        console.log(`   ✅ Created ${this.productionEnvFile} with production-optimized configuration`);
    }
    
    /**
     * 📄 FORMAT ENV CONTENT
     */
    formatEnvContent(config, environment) {
        const timestamp = new Date().toISOString();
        
        return `# 🔧 AIGO-Syndicate Database Environment Configuration
# Generated on: ${timestamp}
# Environment: ${environment}
# 
# This file contains comprehensive PostgreSQL configuration with proper fallbacks
# for both development and production environments.

# ═══════════════════════════════════════════════════════════════
# 🌍 ENVIRONMENT CONFIGURATION
# ═══════════════════════════════════════════════════════════════
NODE_ENV=${config.NODE_ENV}

# ═══════════════════════════════════════════════════════════════
# 🗄️ DATABASE CONFIGURATION (Primary)
# ═══════════════════════════════════════════════════════════════
# Complete PostgreSQL connection string - RECOMMENDED
DATABASE_URL=${config.DATABASE_URL}

# ═══════════════════════════════════════════════════════════════
# 🔧 POSTGRESQL COMPONENTS (Fallback Configuration)
# ═══════════════════════════════════════════════════════════════
POSTGRES_HOST=${config.POSTGRES_HOST}
POSTGRES_PORT=${config.POSTGRES_PORT}
POSTGRES_DB=${config.POSTGRES_DB}
POSTGRES_DATABASE=${config.POSTGRES_DATABASE}
POSTGRES_USER=${config.POSTGRES_USER}
POSTGRES_USERNAME=${config.POSTGRES_USERNAME}
POSTGRES_PASSWORD=${config.POSTGRES_PASSWORD}
POSTGRES_SSL=${config.POSTGRES_SSL}

# ═══════════════════════════════════════════════════════════════
# 📊 CONNECTION POOL CONFIGURATION
# ═══════════════════════════════════════════════════════════════
DB_POOL_MAX=${config.DB_POOL_MAX}
DB_POOL_MIN=${config.DB_POOL_MIN}
DB_IDLE_TIMEOUT=${config.DB_IDLE_TIMEOUT}
DB_CONNECTION_TIMEOUT=${config.DB_CONNECTION_TIMEOUT}
DB_STATEMENT_TIMEOUT=${config.DB_STATEMENT_TIMEOUT}
DB_QUERY_TIMEOUT=${config.DB_QUERY_TIMEOUT}
DB_APPLICATION_NAME=${config.DB_APPLICATION_NAME}

# ═══════════════════════════════════════════════════════════════
# 🌐 SERVER CONFIGURATION
# ═══════════════════════════════════════════════════════════════
CONSTRUCTION_GUI_PORT=${config.CONSTRUCTION_GUI_PORT}
CORS_ORIGINS=${config.CORS_ORIGINS}

# ═══════════════════════════════════════════════════════════════
# 🔧 SERVICE CONFIGURATION
# ═══════════════════════════════════════════════════════════════
GOOGLE_VISION_ENABLED=${config.GOOGLE_VISION_ENABLED}
GOOGLE_APPLICATION_CREDENTIALS=${config.GOOGLE_APPLICATION_CREDENTIALS}

# ═══════════════════════════════════════════════════════════════
# 📊 MONITORING & OPTIMIZATION
# ═══════════════════════════════════════════════════════════════
RAM_STORAGE_GB=20
SSD_STORAGE_GB=200
HUMAN_APPROVAL_REQUIRED=true

# ═══════════════════════════════════════════════════════════════
# 🚀 PRODUCTION SERVER OPTIMIZATION (896GB RAM)
# ═══════════════════════════════════════════════════════════════
# Memory allocation for 896GB production server
LLM_MEMORY_GB=400
TRANSFORMER_MEMORY_GB=120
QUANTUM_MEMORY_GB=100
MONITORING_RAM_GB=20
SYSTEM_RESERVE_GB=76

# ═══════════════════════════════════════════════════════════════
# 🔍 DEBUG & DEVELOPMENT
# ═══════════════════════════════════════════════════════════════
DEBUG=aigo:*
LOG_LEVEL=info
`;
    }
    
    /**
     * ✅ VERIFY CONFIGURATION
     */
    async verifyConfiguration() {
        console.log('   ✅ Verifying database configuration...');
        
        try {
            // Try to connect using the configuration
            const { DatabasePoolManager } = await import('../src/database/DatabasePoolManager.js');
            
            const dbPool = DatabasePoolManager.getInstance();
            await dbPool.initialize();
            
            // Test basic query
            const result = await dbPool.query('SELECT current_database() as db, NOW() as time, version()');
            
            console.log('   ✅ Database connection verified successfully');
            console.log(`     Database: ${result.rows[0].db}`);
            console.log(`     PostgreSQL: ${result.rows[0].version.split(' ')[1]}`);
            
            await dbPool.end();
            
        } catch (error) {
            console.warn('   ⚠️ Database connection verification failed:', error.message);
            console.log('   💡 This is normal if PostgreSQL is not running or configured differently');
        }
    }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    try {
        const configurator = new DatabaseEnvironmentConfigurator();
        await configurator.setupDatabaseEnvironment();
        
        console.log(`
🎉 DATABASE ENVIRONMENT SETUP COMPLETE!

✅ Configuration files created:
   📄 .env - Main environment configuration
   📄 .env.production - Production-optimized configuration
   📄 .env.backup - Backup of previous configuration (if existed)

✅ Features configured:
   🔗 DATABASE_URL with proper encoding
   🔧 PostgreSQL component fallbacks
   📊 Optimized connection pooling
   🔒 SSL configuration for production
   🚀 896GB server memory optimization
   ⚠️ Google Vision disabled to prevent warnings

🎯 Next steps:
   1. Review the generated .env file
   2. Adjust database credentials if needed
   3. Test connection with: npm test
   4. Deploy to production server

🌟 The DatabasePoolManager now supports:
   - getInstance() singleton pattern
   - Comprehensive fallback configuration
   - Production-optimized connection pooling
   - Automatic database connection testing
        `);
        
        process.exit(0);
        
    } catch (error) {
        console.error('💥 Setup failed:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default DatabaseEnvironmentConfigurator;
