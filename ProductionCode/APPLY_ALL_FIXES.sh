#!/bin/bash
# 🚀 APPLY ALL FIXES IN CORRECT ORDER
# ====================================

cd ~/deployment_package_20251016_074413/codebase

echo "🔧 Applying ALL production fixes..."
echo ""

# PHASE 1: Core Infrastructure
echo "📦 Phase 1: Core Infrastructure..."
cp ZERO_ERROR_FIX/src/quantum/TensorFlowCompatibilityLayer.js src/quantum/
cp ZERO_ERROR_FIX/src/memory/QuantumEntanglementEngine.js src/memory/
cp ZERO_ERROR_FIX/src/memory/MemorySinkPrevention.js src/memory/
cp ZERO_ERROR_FIX/src/memory/IntegrateAdvancedMemory.js src/memory/
cp ZERO_ERROR_FIX/learning/adaptive-learning-engine.js learning/

# PHASE 2: Database Layer  
echo "📦 Phase 2: Database Layer..."
cp COMPLETE_FIX/src/database/DatabaseConnectionManager.js src/database/
cp COMPLETE_FIX/src/database/UnifiedDatabaseConfig.js src/database/
cp COMPLETE_FIX/src/database/SafeDatabaseWrapper.js src/database/

# PHASE 3: Utilities
echo "📦 Phase 3: Utilities..."
mkdir -p src/utils src/patches
cp COMPLETE_FIX/src/utils/BackgroundTaskManager.js src/utils/
cp COMPLETE_FIX/src/utils/SafeInitializationWrapper.js src/utils/
cp COMPLETE_FIX/src/patches/ApplyNullGuards.js src/patches/

# PHASE 4: Main Files
echo "📦 Phase 4: Main Files..."
cp COMPLETE_FIX/startfullsyndicate.js .
cp COMPLETE_FIX/launch-construction-syndicate.sh .
chmod +x launch-construction-syndicate.sh

# PHASE 5: Scripts
echo "📦 Phase 5: Scripts..."
mkdir -p scripts
cp COMPLETE_FIX/database/create-all-tables.sql database/
cp COMPLETE_FIX/scripts/initialize-production-database.js scripts/
cp COMPLETE_FIX/scripts/health-check.js scripts/
chmod +x scripts/*.js

echo ""
echo "✅ ALL FIXES APPLIED!"
echo ""
echo "📋 Next steps:"
echo "1. node scripts/initialize-production-database.js"
echo "2. ./launch-construction-syndicate.sh"

