/**
 * Fix for EliteMemoryPersistenceEngine.js
 * This script moves the coordinateCreativityMemoryManagement method
 * inside the class definition to fix the syntax error.
 */

import fs from 'fs';

console.log('🔧 Fixing EliteMemoryPersistenceEngine.js syntax error...');

// Read the file content
const filePath = './src/memory/EliteMemoryPersistenceEngine.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find the class end position (last closing brace)
const classEndPos = content.lastIndexOf('}');

// Find the misplaced method
const methodRegex = /async\s+coordinateCreativityMemoryManagement\s*\([^)]*\)\s*{[\s\S]*?}/;
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
    '\n\n  ' + methodCode + '\n' + 
    content.substring(classEndPos);
  
  // Write the fixed content back to the file
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log('✅ Successfully fixed EliteMemoryPersistenceEngine.js');
} else {
  console.error('❌ Could not find method or class boundaries');
}
