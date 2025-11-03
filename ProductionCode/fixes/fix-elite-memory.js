// Fix for EliteMemoryPersistenceEngine.js - Adding coordinateCreativityMemoryManagement method
// This adds the method inside the class definition
import fs from 'fs';

console.log('🔧 Applying Elite Memory Persistence Engine fix...');

const filePath = './src/memory/EliteMemoryPersistenceEngine.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Find the class end
const classEndIndex = fileContent.lastIndexOf('}');

// Extract the invalid method definition that is outside the class
const methodRegex = /async\s+coordinateCreativityMemoryManagement\s*\([^)]*\)\s*{[\s\S]*?}/g;
const methodMatch = methodRegex.exec(fileContent);

if (!methodMatch) {
  console.log('❌ Could not find coordinateCreativityMemoryManagement method');
  process.exit(1);
}

// Insert the method before the class closing brace
let fixedContent = fileContent.substring(0, classEndIndex);
fixedContent += '\n\n  ' + methodMatch[0] + '\n';
fixedContent += fileContent.substring(classEndIndex);

// Remove the original invalid method outside of class
fixedContent = fixedContent.replace(methodMatch[0], '');

fs.writeFileSync(filePath, fixedContent, 'utf8');
console.log('✅ coordinateCreativityMemoryManagement method is now inside the class definition');
