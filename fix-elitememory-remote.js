/**
 * Direct SSH command to fix EliteMemoryPersistenceEngine.js on the production server
 */

import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function fixRemoteEliteMemory() {
  console.log('🔧 Fixing EliteMemoryPersistenceEngine.js on production server...');

  try {
    // SSH command to fix the file directly on the server
    const sshCommand = `ssh root@162.55.83.33 "cd /root/ProductionCode && node -e \\"
      const fs = require('fs');
      console.log('🔧 Fixing EliteMemoryPersistenceEngine.js syntax error...');
      
      // Read the file content
      const filePath = './src/memory/EliteMemoryPersistenceEngine.js';
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Find the class end position (last closing brace)
      const classEndPos = content.lastIndexOf('}');
      
      // Find the misplaced method
      const methodRegex = /async\\\\s+coordinateCreativityMemoryManagement\\\\s*\\\\([^)]*\\\\)\\\\s*{[\\\\s\\\\S]*?}/;
      const methodMatch = methodRegex.exec(content);
      
      if (methodMatch && classEndPos > 0) {
        console.log('✅ Found misplaced method and class boundary');
        
        // Extract the method code
        const methodCode = methodMatch[0];
        
        // Remove the method from its current position
        content = content.replace(methodCode, '');
        
        // Insert the method inside the class
        const fixedContent = 
          content.substring(0, classEndPos) + 
          '\\\\n\\\\n  ' + methodCode + '\\\\n' + 
          content.substring(classEndPos);
        
        // Write the fixed content back to the file
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log('✅ Successfully fixed EliteMemoryPersistenceEngine.js');
      } else {
        console.error('❌ Could not find method or class boundaries');
      }
    \\"
    "`;

    // Execute the SSH command
    const { stdout, stderr } = await execAsync(sshCommand);
    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('✅ Fix completed! Now starting the application...');
    
    // Start the application
    const startCommand = `ssh root@162.55.83.33 "cd /root/ProductionCode && node start-construction-clean.js"`;
    const { stdout: startOut, stderr: startErr } = await execAsync(startCommand);
    console.log(startOut);
    if (startErr) console.error(startErr);
    
  } catch (error) {
    console.error('❌ Error fixing remote file:', error.message);
  }
}

// Run the fix
fixRemoteEliteMemory();
