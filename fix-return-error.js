// Fix for illegal return statement in EliteMemoryPersistenceEngine.js

import fs from 'fs';

console.log('🔧 Fixing Illegal return statement in EliteMemoryPersistenceEngine.js');

// Read the file content
const filePath = './src/memory/EliteMemoryPersistenceEngine.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find the problematic return statement at line 2930
const lines = content.split('\n');
const problemLine = lines[2929]; // Line 2930 (0-indexed is 2929)

console.log(`Found problematic line: "${problemLine}"`);

// Find the class end position (last closing brace)
const classEndIndex = content.lastIndexOf('}');

// Examine the structure around line 2930
let start = Math.max(0, 2929 - 20); // Start 20 lines before
let end = Math.min(lines.length - 1, 2929 + 20); // End 20 lines after

console.log('Code context around the illegal return:');
for (let i = start; i <= end; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

// Check if there are any misplaced code blocks outside the class
const fileEndContent = content.substring(classEndIndex + 1).trim();
if (fileEndContent.length > 0) {
  console.log('\nFound content after class definition:');
  console.log(fileEndContent);

  // Find all method-like blocks in the content after class end
  const methodRegex = /async\s+\w+\s*\([^)]*\)\s*{[\s\S]*?}/g;
  const methods = [];
  let match;
  
  while ((match = methodRegex.exec(fileEndContent)) !== null) {
    methods.push(match[0]);
  }
  
  if (methods.length > 0) {
    console.log(`Found ${methods.length} methods outside class definition`);
    
    // Remove all found methods from after class end
    let cleanFileEnd = fileEndContent;
    methods.forEach(method => {
      cleanFileEnd = cleanFileEnd.replace(method, '');
    });
    
    // Create new content with methods moved inside class
    let newContent = content.substring(0, classEndIndex);
    methods.forEach(method => {
      newContent += '\n\n  ' + method;
    });
    newContent += '\n}\n' + cleanFileEnd;
    
    // Write the fixed content back to file
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('✅ Fixed by moving all methods inside the class definition');
  } else {
    console.log('No method-like blocks found outside class. Looking for stray return statements...');
    
    // Look for stray return statements
    if (fileEndContent.includes('return')) {
      // Find the content with the return statement
      const returnIndex = fileEndContent.indexOf('return');
      const beforeReturn = fileEndContent.substring(0, returnIndex);
      const afterReturn = fileEndContent.substring(returnIndex);
      
      // Find the nearest opening brace before the return
      const lastOpenBraceBeforeReturn = beforeReturn.lastIndexOf('{');
      
      if (lastOpenBraceBeforeReturn !== -1) {
        // Find matching closing brace
        let braceCount = 1;
        let i = 0;
        while (braceCount > 0 && i < afterReturn.length) {
          if (afterReturn[i] === '{') braceCount++;
          if (afterReturn[i] === '}') braceCount--;
          i++;
        }
        
        if (braceCount === 0) {
          // Found matching brace, extract the method-like block
          const methodLikeBlock = beforeReturn.substring(lastOpenBraceBeforeReturn - 100, lastOpenBraceBeforeReturn) + 
                                 beforeReturn.substring(lastOpenBraceBeforeReturn) + 
                                 afterReturn.substring(0, i);
          
          // Move this block inside the class
          let newContent = content.substring(0, classEndIndex);
          newContent += '\n\n  ' + methodLikeBlock + '\n';
          newContent += '}\n' + fileEndContent.replace(methodLikeBlock, '');
          
          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log('✅ Fixed by identifying and moving code block with return statement');
        }
      }
    }
  }
} else {
  console.log('No content found after class definition, looking for other issues...');
  
  // Make a simple fix: ensure the coordinateCreativityMemoryManagement method is properly inside the class
  // and properly closed
  const methodRegex = /async\s+coordinateCreativityMemoryManagement\s*\([^)]*\)\s*{[\s\S]*?}/;
  const methodMatch = methodRegex.exec(content);
  
  if (methodMatch) {
    console.log('Found coordinateCreativityMemoryManagement method, checking if properly closed...');
    
    // Check if method has proper closing brace
    const methodBody = methodMatch[0];
    const openBraces = methodBody.match(/{/g) || [];
    const closeBraces = methodBody.match(/}/g) || [];
    
    if (openBraces.length > closeBraces.length) {
      console.log('Method has unclosed braces, adding closing brace...');
      
      // Add closing brace to the method
      const methodStart = content.indexOf(methodBody);
      const methodEnd = methodStart + methodBody.length;
      
      let newContent = content.substring(0, methodEnd) + '\n  }' + content.substring(methodEnd);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('✅ Fixed by adding missing closing brace to method');
    }
  }
}

// Direct approach: Find and fix the issue around line 2930
console.log('\nApplying direct fix for return statement at line 2930...');

// Check if there's an unclosed method around line 2930
const problematicSection = lines.slice(2900, 2940).join('\n');
const braceCount = (problematicSection.match(/{/g) || []).length - (problematicSection.match(/}/g) || []).length;

if (braceCount > 0) {
  console.log(`Found unclosed braces (${braceCount}) in the problematic section`);
  
  // Find method signature before line 2930
  let methodStartLine = 2929;
  while (methodStartLine > 2900 && !lines[methodStartLine].includes('async')) {
    methodStartLine--;
  }
  
  if (methodStartLine > 2900) {
    console.log(`Found potential method start at line ${methodStartLine + 1}: ${lines[methodStartLine]}`);
    
    // Add missing closing braces
    for (let i = 0; i < braceCount; i++) {
      lines.splice(2930, 0, '  }');
    }
    
    // Write the fixed content
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`✅ Fixed by adding ${braceCount} missing closing brace(s) before the return statement`);
  }
}

console.log('Fix completed! Please check the file to ensure it has been properly fixed.');
