#!/bin/bash
# Create complete fix package for upload

echo "📦 Creating COMPLETE FIX package..."

mkdir -p COMPLETE_FIX/src/database
mkdir -p COMPLETE_FIX/src/utils
mkdir -p COMPLETE_FIX/src/patches
mkdir -p COMPLETE_FIX/src/quantum
mkdir -p COMPLETE_FIX/src/llm
mkdir -p COMPLETE_FIX/src/learning
mkdir -p COMPLETE_FIX/learning
mkdir -p COMPLETE_FIX/database
mkdir -p COMPLETE_FIX/scripts

# Copy all fixes
cp src/database/DatabaseConnectionManager.js COMPLETE_FIX/src/database/
cp src/database/SafeDatabaseWrapper.js COMPLETE_FIX/src/database/
cp src/database/UnifiedDatabaseConfig.js COMPLETE_FIX/src/database/
cp src/utils/BackgroundTaskManager.js COMPLETE_FIX/src/utils/
cp src/utils/SafeInitializationWrapper.js COMPLETE_FIX/src/utils/
cp src/patches/ApplyNullGuards.js COMPLETE_FIX/src/patches/
cp src/quantum/TensorFlowCompatibilityLayer.js COMPLETE_FIX/src/quantum/
cp src/quantum/QuantumTensorEngine.js COMPLETE_FIX/src/quantum/
cp src/llm/OllamaIntegration.js COMPLETE_FIX/src/llm/
cp src/learning/BoundedA2CDDPSystem.js COMPLETE_FIX/src/learning/
cp src/learning/ConstructionWorldModel.js COMPLETE_FIX/src/learning/
cp src/learning/ConstructionPricePredictor.js COMPLETE_FIX/src/learning/
cp learning/adaptive-learning-engine.js COMPLETE_FIX/learning/
cp database/create-all-tables.sql COMPLETE_FIX/database/
cp scripts/initialize-production-database.js COMPLETE_FIX/scripts/
cp scripts/health-check.js COMPLETE_FIX/scripts/
cp startfullsyndicate.js COMPLETE_FIX/
cp launch-construction-syndicate.sh COMPLETE_FIX/
cp DEPLOYMENT_INSTRUCTIONS.md COMPLETE_FIX/
cp COMPLETE_FIX_SUMMARY.md COMPLETE_FIX/

echo "✅ Complete fix package created in COMPLETE_FIX/"
echo ""
echo "📤 To upload to server:"
echo "scp -r COMPLETE_FIX root@162.55.83.33:/root/deployment_package_20251016_074413/codebase/"

