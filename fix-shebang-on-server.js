#!/usr/bin/env node

/**
 * 🏆 ELITE SHEBANG FIX - PRODUCTION SERVER
 * =======================================
 * 
 * Fix the shebang line position in startfullsyndicate.js
 */

import fs from 'fs';

console.log('🏆 FIXING SHEBANG LINE POSITION');
console.log('==============================');

const filePath = '/root/LocalBackup/startfullsyndicate.js';

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('📖 Read startfullsyndicate.js file');
    
    // Remove any existing shebang lines
    content = content.replace(/^#!/gm, '// REMOVED_SHEBANG');
    console.log('🗑️ Removed existing shebang lines');
    
    // Add the shebang line at the very beginning
    content = `#!/usr/bin/env node\n\n${content}`;
    console.log('✅ Added shebang line at the beginning');
    
    // Write the file back
    fs.writeFileSync(filePath, content);
    console.log('💾 Saved updated startfullsyndicate.js');
    
    console.log('🎉 SHEBANG FIX APPLIED SUCCESSFULLY!');
    
} catch (error) {
    console.error('❌ SHEBANG FIX FAILED:', error.message);
    process.exit(1);
}
