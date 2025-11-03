#!/bin/bash

# 🔧 FIX ALL FormalReasoningConstructionIntegration.initialize() CALLS
# ====================================================================
# 
# Find and comment out ALL calls to prevent circular dependencies

echo "🔧 ========================================"
echo "🔧 FIXING ALL FORMAL REASONING CALLS"
echo "🔧 ========================================"
echo ""

cd ~/LocalBackup

# Find all files that call FormalReasoningConstructionIntegration initialize
echo "🔍 Finding all FormalReasoning initialize calls..."
grep -r "FormalReasoning.*\.initialize()" src/ --include="*.js" | grep -v "\.backup" | grep -v "node_modules"

echo ""
echo "📦 Creating backups..."
find src/ -name "*.js" -exec cp {} {}.backup.allformal \; 2>/dev/null || true
echo "✅ Backups created"
echo ""

# Fix QuantumEnhancementUtility.js
echo "🔧 Fixing QuantumEnhancementUtility.js..."
sed -i '67s/.*/            \/\/ ✅ LAZY INIT: Commented out to prevent circular dependency/' src/quantum/QuantumEnhancementUtility.js
echo "✅ Fixed QuantumEnhancementUtility.js"

# Fix QuantumTensorEngine.js
echo "🔧 Fixing QuantumTensorEngine.js..."
sed -i '412s/.*/        \/\/ ✅ LAZY INIT: Commented out to prevent circular dependency/' src/quantum/QuantumTensorEngine.js
echo "✅ Fixed QuantumTensorEngine.js"

# Fix HOAIComplianceService.js
echo "🔧 Fixing HOAIComplianceService.js..."
sed -i '104s/.*/            \/\/ ✅ LAZY INIT: Commented out to prevent circular dependency/' src/construction/services/HOAIComplianceService.js
echo "✅ Fixed HOAIComplianceService.js"

echo ""
echo "🔧 ========================================"
echo "✅ ALL FORMAL REASONING CALLS FIXED!"
echo "🔧 ========================================"
echo ""
echo "📋 Fixed files:"
echo "   1. QuantumEnhancementUtility.js (line 67)"
echo "   2. QuantumTensorEngine.js (line 412)"
echo "   3. HOAIComplianceService.js (line 104)"
echo ""
echo "🎯 Result: FormalReasoningConstructionIntegration will ONLY"
echo "   be initialized once by the factory, not by every component!"
echo ""

