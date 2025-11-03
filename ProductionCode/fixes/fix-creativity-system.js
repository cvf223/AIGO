// Fix for CreativitySystemIntegrator.js - Add fallback for coordinateSystemWideCreativityIntegration
import fs from 'fs';

console.log('🔧 Applying Creativity System Integrator fix...');

const filePath = './src/creativity/CreativitySystemIntegrator.js';
const fileContent = fs.readFileSync(filePath, 'utf8');

// Find the coordinateSystemWideCreativityIntegration method
const methodRegex = /(async\s+coordinateSystemWideCreativityIntegration\s*\([^)]*\)\s*{[\s\S]*?)(this\.memoryPersistence\.coordinateCreativityMemoryManagement)([\s\S]*?})/;
const match = methodRegex.exec(fileContent);

if (match) {
  // Add null check and fallback implementation
  const fixedMethod = `${match[1]}
    // Add null safety check and fallback for memory coordination
    if (this.memoryPersistence && typeof this.memoryPersistence.coordinateCreativityMemoryManagement === 'function') {
      await this.memoryPersistence.coordinateCreativityMemoryManagement();
    } else {
      console.log('⚠️ Memory persistence coordinateCreativityMemoryManagement not available - using fallback');
      // Fallback implementation for creativity memory management
      await this._fallbackCoordinateCreativityMemory();
    }${match[3]}`;

  // Add fallback method before the class end
  const classEndIndex = fileContent.lastIndexOf('}');
  let fixedContent = fileContent.substring(0, classEndIndex);
  fixedContent += `
  
  // Fallback implementation for creativity memory coordination
  async _fallbackCoordinateCreativityMemory() {
    console.log('🎨 Running fallback creativity memory coordination');
    try {
      // Basic memory coordination fallback
      const highCreativityAgents = Array.from(this.creativityValues.entries())
        .filter(([_, value]) => value > 0.7)
        .map(([agentId]) => agentId);
      
      console.log(\`🧠 Found \${highCreativityAgents.length} high-creativity agents for memory preservation\`);
      
      // Store this information in local cache if available
      if (this.localCache) {
        this.localCache.set('high_creativity_agents', highCreativityAgents);
      }
      
      return true;
    } catch (error) {
      console.warn('⚠️ Fallback creativity memory coordination error:', error.message);
      return false;
    }
  }
  `;
  fixedContent += fileContent.substring(classEndIndex);

  // Fix the original method
  fixedContent = fixedContent.replace(methodRegex, fixedMethod);

  fs.writeFileSync(filePath, fixedContent, 'utf8');
  console.log('✅ Added memory persistence fallback to Creativity System Integrator');
} else {
  console.log('❌ Could not find coordinateSystemWideCreativityIntegration method');
}
