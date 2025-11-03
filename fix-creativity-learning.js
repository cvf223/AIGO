// Fix for CreativityValueLearningSystem.js - Adding broadcast discovery null check
import fs from 'fs';

console.log('🔧 Applying Creativity Value Learning System fix...');

const filePath = './src/creativity/CreativityValueLearningSystem.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Find the storeCrossAgentPattern method with the broadcastDiscovery call
const methodRegex = /(async\s+storeCrossAgentPattern\s*\([^)]*\)\s*{[\s\S]*?)(this\.quantumCommunication\.broadcastDiscovery)([\s\S]*?})/;
const match = methodRegex.exec(fileContent);

if (match) {
  // Add null check and fallback implementation
  const fixedMethod = `${match[1]}
    // Add null safety check for quantum communication
    if (this.quantumCommunication && typeof this.quantumCommunication.broadcastDiscovery === 'function') {
      await this.quantumCommunication.broadcastDiscovery${match[3].trim()}
    } else {
      console.log('📡 Quantum communication broadcast not available - pattern stored locally only');
    }`;

  // Replace the original method
  const fixedContent = fileContent.replace(methodRegex, fixedMethod);

  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log('✅ Added quantum communication null check to Creativity Value Learning System');
} else {
  console.log('❌ Could not find storeCrossAgentPattern method');
}
