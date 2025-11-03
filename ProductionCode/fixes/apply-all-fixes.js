// Main script to apply all fixes

console.log('🔧 ELITE AI FRAMEWORK REPAIR SYSTEM 🔧');
console.log('======================================');
console.log('Applying all critical system fixes...');

// Run all fix scripts in sequence
(async () => {
  try {
    // Ensure necessary modules are installed
    console.log('\n📦 Installing required dependencies...');
    try {
      await import('onnxruntime-node');
      console.log('✅ onnxruntime-node is already installed');
    } catch (error) {
      console.log('⚙️ Installing onnxruntime-node...');
      const { execSync } = await import('child_process');
      execSync('npm install onnxruntime-node', {stdio: 'inherit'});
      console.log('✅ onnxruntime-node installed successfully');
    }
    
    // 1. Fix Elite Memory Persistence Engine
    console.log('\n🧠 Fixing Elite Memory Persistence Engine...');
    await import('./fixes/fix-elite-memory.js');
    
    // 2. Fix Quantum Node Engine
    console.log('\n🌌 Fixing Quantum Node Engine...');
    await import('./fixes/fix-quantum-node.js');
    
    // 3. Fix Creativity System Integrator
    console.log('\n🎨 Fixing Creativity System Integrator...');
    await import('./fixes/fix-creativity-system.js');
    
    // 4. Fix Creativity Value Learning System
    console.log('\n🧪 Fixing Creativity Value Learning System...');
    await import('./fixes/fix-creativity-learning.js');
    
    // 5. Fix Quantum Causal Forecasting Engine
    console.log('\n🔮 Fixing Quantum Causal Forecasting Engine...');
    await import('./fixes/fix-quantum-causal.js');
    
    // 6. Fix Universal Construction Transformer
    console.log('\n🏗️ Fixing Universal Construction Transformer...');
    await import('./fixes/fix-universal-transformer.js');
    
    console.log('\n✅ ALL FIXES APPLIED SUCCESSFULLY!');
    console.log('The system is now resilient to these errors and will fallback gracefully');
    console.log('when encountering missing methods or dependencies.');
    console.log('\nRestart the application with: node start-construction-clean.js');
  } catch (error) {
    console.error('❌ Error applying fixes:', error);
    process.exit(1);
  }
})();
