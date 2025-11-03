#!/usr/bin/env node

/**
 * 🏆 ELITE CONTEXT ENGINE DATABASE FIX - REMOTE APPLICATION
 * =========================================================
 * 
 * This script applies the ContextEngine database fixes directly on the server
 * - Replace executeQuery import with DatabasePoolManager
 * - Add executeQuery method to class
 * - Replace all executeQuery calls with this.executeQuery
 */

import fs from 'fs';

console.log('🏆 APPLYING ELITE CONTEXT ENGINE DATABASE FIXES');
console.log('==============================================');

const filePath = '/root/LocalBackup/src/services/ContextEngine.js';

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('📖 Read ContextEngine.js file');
    
    // Apply fixes
    let fixesApplied = 0;
    
    // 1. Replace the import
    if (content.includes(`import { executeQuery } from '../../database/contract-advancement-database.js';`)) {
        content = content.replace(
            `import { executeQuery } from '../../database/contract-advancement-database.js';`,
            `// 🛠️ ELITE DATABASE INTEGRATION: Use shared pool instead of separate module\nimport { DatabasePoolManager } from '../database/DatabasePoolManager.js';`
        );
        fixesApplied++;
        console.log('✅ Replaced executeQuery import with DatabasePoolManager');
    }
    
    // 2. Add executeQuery method to the class (if not already present)
    if (!content.includes('async executeQuery(query, params = [])')) {
        // Find the end of constructor and add the method
        const constructorEndPattern = /(\s+console\.log\('🧠 Context Engine with evolution capabilities initialized'\);\s+})/;
        if (constructorEndPattern.test(content)) {
            content = content.replace(
                constructorEndPattern,
                `$1\n\n    /**\n     * 🛠️ ELITE DATABASE INTEGRATION: Execute query using shared pool\n     */\n    async executeQuery(query, params = []) {\n        if (!this.dbPool) {\n            this.dbPool = DatabasePoolManager.getSharedPool();\n            if (!this.dbPool) {\n                throw new Error('Database pool not available. Ensure DatabasePoolManager is initialized first.');\n            }\n        }\n        \n        const client = await this.dbPool.connect();\n        try {\n            const result = await client.query(query, params);\n            return result;\n        } finally {\n            client.release();\n        }\n    }`
            );
            fixesApplied++;
            console.log('✅ Added executeQuery method to ContextEngine class');
        }
    }
    
    // 3. Add dbPool property to constructor (if not already present)
    if (!content.includes('this.dbPool = null')) {
        const constructorPropertiesPattern = /(this\.contextEngineSFTGovernor = null;\s+)/;
        if (constructorPropertiesPattern.test(content)) {
            content = content.replace(
                constructorPropertiesPattern,
                `$1\n        // 🛠️ DATABASE INTEGRATION\n        this.dbPool = null;  // Will be initialized using shared pool\n        `
            );
            fixesApplied++;
            console.log('✅ Added dbPool property to constructor');
        }
    }
    
    // 4. Replace all executeQuery calls with this.executeQuery
    const executeQueryPattern = /(?<!this\.)executeQuery\(/g;
    const executeQueryMatches = content.match(executeQueryPattern);
    if (executeQueryMatches) {
        content = content.replace(executeQueryPattern, 'this.executeQuery(');
        fixesApplied += executeQueryMatches.length;
        console.log(`✅ Replaced ${executeQueryMatches.length} executeQuery calls with this.executeQuery`);
    }
    
    // Write the file back
    fs.writeFileSync(filePath, content);
    console.log('💾 Saved updated ContextEngine.js');
    
    console.log('\n📊 FIX SUMMARY:');
    console.log(`   🔧 Total fixes applied: ${fixesApplied}`);
    
    if (fixesApplied > 0) {
        console.log('🎉 CONTEXT ENGINE DATABASE FIXES APPLIED SUCCESSFULLY!');
    } else {
        console.log('ℹ️ No fixes needed - ContextEngine appears already updated');
    }
    
} catch (error) {
    console.error('❌ CONTEXT ENGINE FIX FAILED:', error.message);
    process.exit(1);
}
