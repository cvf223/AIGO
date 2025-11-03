// Fix for QuantumNodeEngine.js - Removing extra brace
import fs from 'fs';

console.log('🔧 Applying Quantum Node Engine fix...');

const filePath = './src/quantum/QuantumNodeEngine.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

// We need to find line 468 with the extra closing brace
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
    console.log(`Line content: "${line468}"`);
  }
} else {
  console.log('❌ File has fewer than 468 lines');
}
