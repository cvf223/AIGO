// Fix for UniversalConstructionTransformer.js - Adding onnxruntime-node fallback
import fs from 'fs';

console.log('🔧 Applying Universal Construction Transformer fix...');

const filePath = './src/transformers/UniversalConstructionTransformer.js';

// Check if file exists
if (fs.existsSync(filePath)) {
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Fix the onnxruntime-node import with a conditional import
  const importRegex = /(import\s+[^;]*\s+from\s+['"]onnxruntime-node['"])/;
  
  if (importRegex.test(fileContent)) {
    const fixedContent = fileContent.replace(importRegex, `
// Conditional import for onnxruntime-node with graceful fallback
let onnx;
try {
  onnx = await import('onnxruntime-node');
} catch (error) {
  console.warn('⚠️ onnxruntime-node not available - vision features will be limited');
  onnx = {
    InferenceSession: class MockInferenceSession {
      constructor() {
        console.warn('🔧 Using mock ONNX session');
      }
      async run() { 
        return { 
          output: new Float32Array([0.5, 0.5, 0.5]) 
        }; 
      }
    }
  };
}`);

    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log('✅ Added onnxruntime-node fallback to Universal Construction Transformer');
  } else {
    console.log('❓ Could not find onnxruntime-node import');
  }
} else {
  console.log('❌ File not found: ' + filePath);
}
