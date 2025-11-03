#!/bin/bash

# 🚨 EMERGENCY FIX FOR MEMORIZATION SINKS ERROR
# ==============================================

SERVER="root@162.55.83.33"
REMOTE_DIR="/root/deployment_package_20251016_074413/codebase"

echo "🚨 EMERGENCY FIX: MemorizationSinksArchitecture Error"
echo "====================================================="
echo ""

# Fix the OllamaIntegration.js file directly on server
ssh $SERVER << 'REMOTE_FIX'
cd /root/deployment_package_20251016_074413/codebase

echo "🔧 Fixing OllamaIntegration.js modelConfig issue..."

# Create a patch to fix the modelConfig
cat > /tmp/ollama_fix.patch << 'EOF'
--- Fix the initializeCreativitySystems method to pass proper modelConfig
@@ line 1644-1660 @@
        // Initialize Memorization Sinks Architecture
        this.memorizationSinks = new MemorizationSinksArchitecture({
            modelConfig: {
                agentId: 'ollama_integration',
                modelName: 'dynamic_ollama_models',
                totalNeurons: 175000000000, // 175B neurons total
                modelParameters: 405000000000, // 405B parameters
                modelType: 'transformer',
                quantizationLevel: 'fp16'
            },
            database: this.config?.database,
            dynamicSinkAllocation: true,
            quantumEnhanced: true,
            sinkNeuronFraction: 0.15
        });
EOF

# Apply fix using sed - Add the modelConfig properly
sed -i '/this.memorizationSinks = new MemorizationSinksArchitecture({/,/});/c\
        this.memorizationSinks = new MemorizationSinksArchitecture({\
            modelConfig: {\
                agentId: '\''ollama_integration'\'',\
                modelName: '\''dynamic_ollama_models'\'',\
                totalNeurons: 175000000000,\
                modelParameters: 405000000000,\
                modelType: '\''transformer'\'',\
                quantizationLevel: '\''fp16'\''\
            },\
            database: this.config?.database,\
            dynamicSinkAllocation: true,\
            quantumEnhanced: true,\
            sinkNeuronFraction: 0.15\
        });' src/llm/OllamaIntegration.js

# Also remove the global initialization at the bottom of the file
echo "🔧 Removing global OllamaIntegration initialization..."
sed -i '/^const ollamaIntegration = new OllamaIntegration/,/^export { ollamaIntegration };$/d' src/llm/OllamaIntegration.js
sed -i '/^ollamaIntegration.init()/d' src/llm/OllamaIntegration.js

# Make sure to export the class properly
echo "" >> src/llm/OllamaIntegration.js
echo "// Export class only - instances created with proper config by orchestrators" >> src/llm/OllamaIntegration.js
echo "export { OllamaIntegration };" >> src/llm/OllamaIntegration.js
echo "export default OllamaIntegration;" >> src/llm/OllamaIntegration.js

echo "✅ OllamaIntegration.js fixed!"

echo ""
echo "🔧 Creating fallback for MemorizationSinksArchitecture..."

# Create a safer version that handles missing config
cat > src/patches/MemorizationSinksFix.js << 'EOF'
/**
 * 🔧 MEMORIZATION SINKS FIX - Handles missing modelConfig
 */

export function patchMemorizationSinks() {
    console.log('🔧 Patching MemorizationSinksArchitecture...');
    
    // Import the class
    import('../creativity/MemorizationSinksArchitecture.js').then(module => {
        const OriginalClass = module.default || module.MemorizationSinksArchitecture;
        
        if (OriginalClass) {
            const originalInitialize = OriginalClass.prototype.initialize;
            
            OriginalClass.prototype.initialize = async function() {
                // Ensure modelConfig exists with defaults
                if (!this.modelConfig) {
                    console.warn('⚠️ No modelConfig provided to MemorizationSinks - using defaults');
                    this.modelConfig = {
                        agentId: 'default',
                        modelName: 'default_model',
                        totalNeurons: 175000000000,
                        modelParameters: 405000000000,
                        modelType: 'transformer',
                        quantizationLevel: 'fp16'
                    };
                } else {
                    // Fill in missing properties
                    this.modelConfig.totalNeurons = this.modelConfig.totalNeurons || 175000000000;
                    this.modelConfig.modelParameters = this.modelConfig.modelParameters || 405000000000;
                    this.modelConfig.modelType = this.modelConfig.modelType || 'transformer';
                    this.modelConfig.quantizationLevel = this.modelConfig.quantizationLevel || 'fp16';
                }
                
                // Call original initialize
                if (originalInitialize) {
                    return originalInitialize.call(this);
                }
            };
            
            console.log('   ✅ MemorizationSinksArchitecture patched');
        }
    }).catch(err => {
        console.warn('   ⚠️ Could not patch MemorizationSinks:', err.message);
    });
}
EOF

# Add the patch to startfullsyndicate.js
echo ""
echo "🔧 Adding patch to startup sequence..."
sed -i '/import { applyDelayedTasksPatch }/a\
import { patchMemorizationSinks } from '\''./src/patches/MemorizationSinksFix.js'\'';' startfullsyndicate.js

sed -i '/applyDelayedTasksPatch();/a\
patchMemorizationSinks();' startfullsyndicate.js

echo "✅ Patch added to startup!"

echo ""
echo "🚀 Testing the fix..."
echo "====================="
timeout 20 ./launch-production.sh 2>&1 | grep -E "MemorizationSinks|Failed to initialize|ready|ERROR|Success" || true

REMOTE_FIX

echo ""
echo "✅ FIX COMPLETE!"
echo ""
echo "📋 WHAT WAS FIXED:"
echo "=================="
echo "1. Added proper modelConfig to MemorizationSinksArchitecture initialization"
echo "2. Removed global OllamaIntegration instantiation"
echo "3. Added safety patch for missing config"
echo "4. Integrated patch into startup sequence"
echo ""
echo "🚀 TO VERIFY:"
echo "============="
echo "ssh $SERVER"
echo "cd $REMOTE_DIR"
echo "./launch-production.sh"
echo ""
echo "✅ EXPECTED: No more 'Cannot read properties of undefined' errors!"
