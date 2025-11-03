const fs = require('fs');
const path = require('path');

const startupFile = path.join(__dirname, 'startfullsyndicate.js');
let content = fs.readFileSync(startupFile, 'utf8');

// Add enhanced database manager import at the top
const importStatement = `import databaseManager from './src/database/EnhancedDatabaseManager.js';\n`;

if (!content.includes('EnhancedDatabaseManager')) {
    // Add after other imports
    const importIndex = content.indexOf('import ');
    if (importIndex !== -1) {
        // Find the end of imports section
        const lines = content.split('\n');
        let lastImportIndex = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIndex = i;
            }
        }
        lines.splice(lastImportIndex + 1, 0, importStatement);
        content = lines.join('\n');
    }
}

// Add database initialization as FIRST step in initialize()
const initPattern = /async initialize\(\) {[\s\S]*?try {/;
const dbInitCode = `async initialize() {
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
            console.log('=========================================');
            
        try {`;

content = content.replace(initPattern, dbInitCode);

// Save the fixed file
fs.writeFileSync(startupFile, content);
console.log('✅ Fixed startup sequence to initialize database first');
