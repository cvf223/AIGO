import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startupFile = path.join(__dirname, 'startfullsyndicate.js');
let content = fs.readFileSync(startupFile, 'utf8');

// Add enhanced database manager import if not present
const importStatement = `import databaseManager from './src/database/EnhancedDatabaseManager.js';`;

if (!content.includes('EnhancedDatabaseManager')) {
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
            lastImportIndex = i;
        }
    }
    
    // Add our import after the last import
    lines.splice(lastImportIndex + 1, 0, importStatement);
    content = lines.join('\n');
}

// Ensure database is initialized FIRST in the initialize method
if (!content.includes('PHASE 0: DATABASE INITIALIZATION')) {
    // Find the initialize method
    const initMethodRegex = /async initialize\(\) {[^{]*/;
    const match = content.match(initMethodRegex);
    
    if (match) {
        const replacement = `async initialize() {
        console.log('🚀 Starting Elite Construction AI Syndicate...');
        console.log('==================================================');
        
        try {
            // 🔴 CRITICAL: Initialize database FIRST before anything else
            console.log('\\n📋 PHASE 0: DATABASE INITIALIZATION (CRITICAL)');
            console.log('================================================');
            
            try {
                await databaseManager.initialize();
                const status = databaseManager.getStatus();
                console.log('   ✅ Database initialized successfully');
                console.log('   📊 Connection pool:', status.poolStats);
                
                // Make database available globally for all systems
                this.dbPool = await databaseManager.getPool();
                global.dbPool = this.dbPool;
                
            } catch (dbError) {
                console.error('\\n❌ CRITICAL: Database initialization failed!');
                console.error('   Error:', dbError.message);
                console.error('\\n🔴 SYSTEM CANNOT OPERATE WITHOUT DATABASE');
                console.error('   Please ensure PostgreSQL is running and accessible');
                process.exit(1); // Exit if database fails - no fallbacks!
            }
            
            console.log('\\n📋 PHASE 1: CORE SYSTEM INITIALIZATION');
            console.log('=========================================');`;
            
        content = content.replace(initMethodRegex, replacement);
    }
}

// Save the fixed file
fs.writeFileSync(startupFile, content);
console.log('✅ Fixed startup sequence to initialize database first');
