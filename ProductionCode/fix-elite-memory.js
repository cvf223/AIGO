// Fix for EliteMemoryPersistenceEngine.js
const fs = require('fs');

console.log('🔧 Applying Elite Memory Persistence Engine fix...');
const filePath = './src/memory/EliteMemoryPersistenceEngine.js';

// Check if file exists
if (fs.existsSync(filePath)) {
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Find the class end and the invalid method
  const classEndIndex = fileContent.lastIndexOf('}');
  const methodRegex = /async\s+coordinateCreativityMemoryManagement\s*\([^)]*\)\s*{[\s\S]*?}/;
  const methodMatch = methodRegex.exec(fileContent);

  if (methodMatch) {
    // Move method inside class
    let fixedContent = fileContent.substring(0, classEndIndex);
    fixedContent += '\n\n  ' + methodMatch[0] + '\n';
    fixedContent += fileContent.substring(classEndIndex);
    
    // Remove original method outside of class
    fixedContent = fixedContent.replace(methodMatch[0], '');
    
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log('✅ coordinateCreativityMemoryManagement method is now inside the class definition');
  } else {
    console.log('❌ Could not find coordinateCreativityMemoryManagement method');
  }
} else {
  console.log('❌ File not found: ' + filePath);
}
