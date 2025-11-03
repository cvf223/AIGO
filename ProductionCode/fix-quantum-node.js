// Fix for QuantumNodeEngine.js
const fs = require('fs');

console.log('🔧 Applying Quantum Node Engine fix...');
const filePath = './src/quantum/QuantumNodeEngine.js';

// Check if file exists
if (fs.existsSync(filePath)) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  
  // Find the line with the extra brace
  if (lines.length >= 468) {
    const line468 = lines[467]; // 0-indexed
    
    if (line468.trim() === '}') {
      // Remove the extra brace
      lines.splice(467, 1);
      const fixedContent = lines.join('\n');
      
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log('✅ Removed extra closing brace on line 468');
    } else {
      console.log('❓ Line 468 does not contain only a closing brace as expected');
      console.log();
    }
  } else {
    console.log('❌ File has fewer than 468 lines');
  }
} else {
  console.log('❌ File not found: ' + filePath);
}
