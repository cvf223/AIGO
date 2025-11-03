// Simple and direct fix for illegal return statement in EliteMemoryPersistenceEngine.js

import fs from 'fs';

console.log('🔧 Fixing Illegal return statement in EliteMemoryPersistenceEngine.js');

// Read the file content
const filePath = './src/memory/EliteMemoryPersistenceEngine.js';
const content = fs.readFileSync(filePath, 'utf8');

// Find line 2930 with the illegal return statement
const lines = content.split('\n');
const illegalReturnLine = lines[2929]; // 0-indexed, so 2930 is at index 2929

console.log(`Problematic line ${2930}: "${illegalReturnLine}"`);

// Inspect surrounding lines to understand the context
console.log('Context:');
for (let i = 2925; i < 2935 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

// Fix: Insert a closing brace before the return statement to ensure it's inside a method
if (illegalReturnLine.trim() === 'return result;') {
  console.log('Found the illegal return statement, adding method closing brace');
  
  // Simply add a closing brace before line 2930
  lines.splice(2929, 0, '  }');
  
  // Add opening method brace if needed
  // This is a guess, but likely scenario is that we're missing a closing brace
  
  // Write the fixed content back to file
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('✅ Added closing brace before the return statement');
} else {
  console.error(`❌ Line ${2930} doesn't match expected content`);
  
  // Alternative approach: Find and fix coordinateCreativityMemoryManagement method
  console.log('Attempting to fix coordinateCreativityMemoryManagement method structure...');
  
  // Find the method
  const methodSignature = 'async coordinateCreativityMemoryManagement(options = {})';
  const methodIndex = content.indexOf(methodSignature);
  
  if (methodIndex !== -1) {
    // Find method body
    const methodStart = content.indexOf('{', methodIndex);
    
    if (methodStart !== -1) {
      // Look for unbalanced braces in method
      let braceCount = 1;
      let i = methodStart + 1;
      
      while (i < content.length && braceCount > 0) {
        if (content[i] === '{') braceCount++;
        if (content[i] === '}') braceCount--;
        i++;
      }
      
      if (braceCount > 0) {
        console.log(`Found unbalanced braces, adding ${braceCount} closing brace(s)`);
        
        // Add necessary closing braces at the end of the method (around line 2930)
        const returnLineIndex = content.indexOf('return result;', methodStart);
        
        if (returnLineIndex !== -1) {
          const newLineIndex = content.indexOf('\n', returnLineIndex);
          let fixedContent = content.substring(0, newLineIndex + 1);
          
          for (let j = 0; j < braceCount; j++) {
            fixedContent += '  }\n';
          }
          
          fixedContent += content.substring(newLineIndex + 1);
          
          fs.writeFileSync(filePath, fixedContent, 'utf8');
          console.log('✅ Added missing closing brace(s) after return statement');
        }
      }
    }
  }
}
