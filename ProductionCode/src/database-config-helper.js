/**
 * 🗃️ DATABASE CONFIGURATION HELPER
 * ================================
 * 
 * BRUTAL TRUTH: Centralized database configuration to fix all the 
 * Database configuration helper for construction syndicate
 */

/**
 * Get the correct database URL based on environment variables
 * Prioritizes DATABASE_URL, then constructs from individual components
 */
function getDatabaseUrl() {
    // If DATABASE_URL is explicitly set, use it
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    
    // Otherwise, construct from individual components
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = process.env.POSTGRES_PORT || '5432';
    const database = process.env.POSTGRES_DB || 'construction_syndicate';
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || 'password';
    const ssl = process.env.POSTGRES_SSL === 'true' ? '?sslmode=require' : '';
    
    return `postgresql://${user}:${password}@${host}:${port}/${database}${ssl}`;
}

/**
 * Get database connection configuration object
 */
function getDatabaseConfig() {
    return {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'construction_syndicate',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password',
        ssl: process.env.POSTGRES_SSL === 'true'
    };
}

/**
 * Get the correct database name
 */
function getDatabaseName() {
    return process.env.POSTGRES_DB || 'construction_syndicate';
}

/**
 * Log current database configuration (for debugging)
 */
function logDatabaseConfig() {
    console.log('🗃️ DATABASE CONFIGURATION:');
    console.log(`   Host: ${process.env.POSTGRES_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.POSTGRES_PORT || '5432'}`);
    console.log(`   Database: ${process.env.POSTGRES_DB || 'construction_syndicate'}`);
    console.log(`   User: ${process.env.POSTGRES_USER || 'postgres'}`);
    console.log(`   SSL: ${process.env.POSTGRES_SSL === 'true' ? 'enabled' : 'disabled'}`);
    console.log(`   URL: ${getDatabaseUrl()}`);
}

export {
    getDatabaseUrl,
    getDatabaseConfig,
    getDatabaseName,
    logDatabaseConfig
}; 