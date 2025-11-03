#!/bin/bash

echo "========================================="
echo "🔧 FIXING ALL CONSTRUCTION IMPORT PATHS"
echo "========================================="
echo ""
echo "Fixing 113 files with incorrect import paths..."
echo ""

# Fix FormalReasoningConstructionIntegration imports
find src -name "*.js" -type f -exec sed -i.bak \
  's|../../../src/construction/cognitive/FormalReasoningConstructionIntegration|../construction/cognitive/FormalReasoningConstructionIntegration|g' {} \;

# Fix ProactiveConstructionKnowledgePipeline imports  
find src -name "*.js" -type f -exec sed -i.bak \
  's|../../../src/construction/prevention/ProactiveConstructionKnowledgePipeline|../construction/prevention/ProactiveConstructionKnowledgePipeline|g' {} \;

# Fix ProactiveConstructionInferenceEngine imports
find src -name "*.js" -type f -exec sed -i.bak \
  's|../../../src/construction/prevention/ProactiveConstructionInferenceEngine|../construction/prevention/ProactiveConstructionInferenceEngine|g' {} \;

# Fix ConstructionNeuroSymbolicScaffolding imports
find src -name "*.js" -type f -exec sed -i.bak \
  's|../../../src/construction/cognitive/ConstructionNeuroSymbolicScaffolding|../construction/cognitive/ConstructionNeuroSymbolicScaffolding|g' {} \;

# Fix all other construction-related imports with triple ../../../src
find src -name "*.js" -type f -exec sed -i.bak \
  's|../../../src/construction/|../construction/|g' {} \;

# Count how many files were fixed
FIXED_COUNT=$(find src -name "*.js.bak" -type f | wc -l)

# Clean up backup files
find src -name "*.js.bak" -type f -delete

echo "✅ Fixed $FIXED_COUNT files"
echo ""

# Verify no more incorrect paths remain
echo "Checking for any remaining incorrect paths..."
REMAINING=$(grep -r "../../../src/construction/" src --include="*.js" | wc -l)

if [ $REMAINING -eq 0 ]; then
    echo "✅ All import paths have been fixed!"
    echo ""
    echo "========================================="
    echo "SUCCESS: Import paths corrected"
    echo "========================================="
else
    echo "⚠️ Warning: $REMAINING incorrect paths still found"
    grep -r "../../../src/construction/" src --include="*.js" | head -5
fi
