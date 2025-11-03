// ESM compatible fix script
import fs from 'fs';
import { execSync } from 'child_process';

console.log('🔧 ELITE AI FRAMEWORK REPAIR SYSTEM 🔧');
console.log('======================================');

// Try to install onnxruntime-node
try {
  console.log('📦 Installing onnxruntime-node...');
  execSync('npm install onnxruntime-node', {stdio: 'inherit'});
  console.log('✅ onnxruntime-node installed successfully');
} catch (error) {
  console.error('❌ Failed to install onnxruntime-node:', error.message);
}

// Fix 1: EliteMemoryPersistenceEngine.js
console.log('\n🧠 Fixing Elite Memory Persistence Engine...');
const memoryPath = './src/memory/EliteMemoryPersistenceEngine.js';
try {
  let memoryContent = fs.readFileSync(memoryPath, 'utf8');

  // Find the class end and the invalid method
  const classEndIndex = memoryContent.lastIndexOf('}');
  const methodRegex = /async\s+coordinateCreativityMemoryManagement\s*\([^)]*\)\s*{[\s\S]*?}/;
  const methodMatch = methodRegex.exec(memoryContent);

  if (methodMatch) {
    // Move method inside class
    let fixedContent = memoryContent.substring(0, classEndIndex);
    fixedContent += '\n\n  ' + methodMatch[0] + '\n';
    fixedContent += memoryContent.substring(classEndIndex);
    
    // Remove original method outside of class
    fixedContent = fixedContent.replace(methodMatch[0], '');
    
    fs.writeFileSync(memoryPath, fixedContent, 'utf8');
    console.log('✅ coordinateCreativityMemoryManagement method is now inside the class definition');
  } else {
    console.log('❌ Could not find coordinateCreativityMemoryManagement method');
  }
} catch (error) {
  console.error('❌ Error fixing EliteMemoryPersistenceEngine.js:', error.message);
}

// Fix 2: QuantumNodeEngine.js
console.log('\n🌌 Fixing Quantum Node Engine...');
const quantumPath = './src/quantum/QuantumNodeEngine.js';
try {
  let quantumContent = fs.readFileSync(quantumPath, 'utf8');
  const lines = quantumContent.split('\n');
  
  // Find the line with the extra brace
  if (lines.length >= 468) {
    const line468 = lines[467]; // 0-indexed
    
    if (line468.trim() === '}') {
      // Remove the extra brace
      lines.splice(467, 1);
      fs.writeFileSync(quantumPath, lines.join('\n'), 'utf8');
      console.log('✅ Removed extra closing brace on line 468');
    } else {
      console.log('❓ Line 468 does not contain only a closing brace as expected');
      console.log();
    }
  } else {
    console.log('❌ File has fewer than 468 lines');
  }
} catch (error) {
  console.error('❌ Error fixing QuantumNodeEngine.js:', error.message);
}

console.log('\n✅ FIXES APPLIED SUCCESSFULLY!');
console.log('You can now restart the application with: node start-construction-clean.js');
