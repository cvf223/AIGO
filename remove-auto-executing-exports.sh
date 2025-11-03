#!/bin/bash

# 🔧 REMOVE AUTO-EXECUTING EXPORTS
# =================================
# This script removes all auto-executing singleton exports

echo "🔧 ========================================"
echo "🔧 REMOVING AUTO-EXECUTING EXPORTS"
echo "🔧 ========================================"
echo ""

cd ~/LocalBackup

# Backup files first
echo "📦 Creating backups..."
cp src/memory/IntegrateAdvancedMemory.js src/memory/IntegrateAdvancedMemory.js.backup
cp src/memory/ComprehensivePersistenceLayer.js src/memory/ComprehensivePersistenceLayer.js.backup
cp src/construction/prevention/ProactiveConstructionKnowledgePipeline.js src/construction/prevention/ProactiveConstructionKnowledgePipeline.js.backup
cp src/construction/prevention/ProactiveConstructionInferenceEngine.js src/construction/prevention/ProactiveConstructionInferenceEngine.js.backup
cp src/construction/prevention/ProactiveConstructionVeracityJudge.js src/construction/prevention/ProactiveConstructionVeracityJudge.js.backup
echo "✅ Backups created"
echo ""

# Fix 1: IntegrateAdvancedMemory.js
echo "🔧 Fixing IntegrateAdvancedMemory.js..."
sed -i 's/^export const advancedMemoryIntegration = new IntegrateAdvancedMemory();$/\/\/ ❌ REMOVED AUTO-EXECUTION: export const advancedMemoryIntegration = new IntegrateAdvancedMemory();/' src/memory/IntegrateAdvancedMemory.js
echo "✅ Fixed IntegrateAdvancedMemory.js"

# Fix 2: ComprehensivePersistenceLayer.js
echo "🔧 Fixing ComprehensivePersistenceLayer.js..."
sed -i 's/^export const comprehensivePersistence = new ComprehensivePersistenceLayer();$/\/\/ ❌ REMOVED AUTO-EXECUTION: export const comprehensivePersistence = new ComprehensivePersistenceLayer();/' src/memory/ComprehensivePersistenceLayer.js
echo "✅ Fixed ComprehensivePersistenceLayer.js"

# Fix 3: ProactiveConstructionKnowledgePipeline.js
echo "🔧 Fixing ProactiveConstructionKnowledgePipeline.js..."
sed -i 's/^export const proactiveConstructionKnowledge = new ProactiveConstructionKnowledgePipeline();$/\/\/ ❌ REMOVED AUTO-EXECUTION: export const proactiveConstructionKnowledge = new ProactiveConstructionKnowledgePipeline();/' src/construction/prevention/ProactiveConstructionKnowledgePipeline.js
echo "✅ Fixed ProactiveConstructionKnowledgePipeline.js"

# Fix 4: ProactiveConstructionInferenceEngine.js
echo "🔧 Fixing ProactiveConstructionInferenceEngine.js..."
sed -i 's/^export const proactiveConstructionInference = new ProactiveConstructionInferenceEngine();$/\/\/ ❌ REMOVED AUTO-EXECUTION: export const proactiveConstructionInference = new ProactiveConstructionInferenceEngine();/' src/construction/prevention/ProactiveConstructionInferenceEngine.js
echo "✅ Fixed ProactiveConstructionInferenceEngine.js"

# Fix 5: ProactiveConstructionVeracityJudge.js
echo "🔧 Fixing ProactiveConstructionVeracityJudge.js..."
sed -i 's/^export const constructionVeracityJudge = new ProactiveConstructionVeracityJudge();$/\/\/ ❌ REMOVED AUTO-EXECUTION: export const constructionVeracityJudge = new ProactiveConstructionVeracityJudge();/' src/construction/prevention/ProactiveConstructionVeracityJudge.js
echo "✅ Fixed ProactiveConstructionVeracityJudge.js"

echo ""
echo "🔧 ========================================"
echo "✅ ALL AUTO-EXECUTING EXPORTS REMOVED!"
echo "🔧 ========================================"
echo ""
echo "📋 Files modified:"
echo "   1. src/memory/IntegrateAdvancedMemory.js"
echo "   2. src/memory/ComprehensivePersistenceLayer.js"
echo "   3. src/construction/prevention/ProactiveConstructionKnowledgePipeline.js"
echo "   4. src/construction/prevention/ProactiveConstructionInferenceEngine.js"
echo "   5. src/construction/prevention/ProactiveConstructionVeracityJudge.js"
echo ""
echo "📦 Backups saved with .backup extension"
echo ""

