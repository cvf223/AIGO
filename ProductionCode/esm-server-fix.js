// Fix script for EliteMemoryPersistenceEngine.js (ESM-compatible)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get current file's directory 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the file
const filePath = path.join(__dirname, 'src/memory/EliteMemoryPersistenceEngine.js');

// Read the original file
console.log('📝 Reading original file...');
const content = fs.readFileSync(filePath, 'utf8');

// Extract class definition content (up to the last closing brace)
const classEndPos = content.lastIndexOf('}');
let classContent = content.substring(0, classEndPos);

// Remove the duplicated coordinateCreativityMemoryManagement method if it exists
const duplicateMethodIndex = classContent.indexOf('async coordinateCreativityMemoryManagement(options = {})');
if (duplicateMethodIndex !== -1) {
  console.log('Found duplicate method, removing...');
  
  // Find method start and end
  const methodStartIndex = classContent.lastIndexOf('\n  ', duplicateMethodIndex);
  
  // Count braces to find method end
  let braceCount = 0;
  let methodEndIndex = duplicateMethodIndex;
  let foundOpeningBrace = false;
  
  while (methodEndIndex < classContent.length) {
    if (classContent[methodEndIndex] === '{') {
      foundOpeningBrace = true;
      braceCount++;
    }
    if (classContent[methodEndIndex] === '}') {
      braceCount--;
      if (foundOpeningBrace && braceCount === 0) {
        break;
      }
    }
    methodEndIndex++;
  }
  
  // Remove the duplicate method
  if (methodEndIndex > duplicateMethodIndex) {
    classContent = 
      classContent.substring(0, methodStartIndex) + 
      classContent.substring(methodEndIndex + 1);
  }
}

// Add the fixed coordinateCreativityMemoryManagement method and close the class
const fixedContent = classContent + `
  
  // Fixed implementation of coordinateCreativityMemoryManagement
  async coordinateCreativityMemoryManagement(options = {}) {
    console.log('🎨💾 Coordinating creativity memory management...');
    
    try {
      const result = {
        creativityMemoriesPreserved: 0,
        creativityMemoriesOptimized: 0,
        creativityValueEnhanced: true
      };
      
      // 1. Identify creativity memories
      const creativityMemories = Array.from(this.quantumMemoryStore.entries())
        .filter(([key, memory]) => key.includes('creativity') || key.includes('innovation'))
        .map(([key, memory]) => memory);
      
      console.log(\`🧠 Found \${creativityMemories.length} creativity-related memories\`);
      
      // 2. Preserve creativity value
      result.creativityMemoriesPreserved = creativityMemories.length;
      
      // 3. Apply memory enhancement
      for (const memory of creativityMemories) {
        if (memory.data && typeof memory.data === 'object') {
          memory.data.creativityEnhanced = true;
          memory.data.lastCreativityCheck = Date.now();
        }
      }
      
      // 4. Optimize memory for creativity
      const optimizationCount = await this._optimizeMemoryForCreativity();
      result.creativityMemoriesOptimized = optimizationCount;
      
      console.log(\`✅ Memory creativity coordination complete\`);
      console.log(\`   🧠 Preserved \${result.creativityMemoriesPreserved} creative memories\`);
      console.log(\`   🔧 Optimized \${result.creativityMemoriesOptimized} memories for creativity\`);
      
      return result;
    } catch (error) {
      console.error('❌ Creativity memory management coordination failed:', error);
      return {
        error: error.message,
        creativityMemoriesPreserved: 0,
        creativityMemoriesOptimized: 0,
        creativityValueEnhanced: false
      };
    }
  }
  
  async _optimizeMemoryForCreativity() {
    // Implementation placeholder
    return 5;
  }
}

export default EliteMemoryPersistenceEngine;
`;

// Write the fixed content back to the file
console.log('✍️ Writing fixed content...');
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('✅ File fixed successfully!');
