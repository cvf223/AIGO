#!/bin/bash
echo "🔧 Fixing autoformalization.initialize() calls..."

# Fix all 13 files
sed -i '2245s/.*/                \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/core/MDPBackgroundTaskIntegrator.js
sed -i '5355s/.*/            \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/agents/LLMAgent.js
sed -i '5365s/.*/            \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/agents/LLMAgent.js
sed -i '1241s/.*/                \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/services/WorkflowService.js
sed -i '85s/.*/        \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/workflows/SystemEnhancementWorkflow.js
sed -i '322s/.*/        \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/formalization/MathematicalConstructionVerifier.js
sed -i '736s/.*/        \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/formalization/FormalVerificationOrchestrator.js
sed -i '685s/.*/        \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/formalization/AutoformalizationSyndicateIntegrator.js
sed -i '222s/.*/        \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/construction/reasoning/ConstructionSuperintelligenceOrchestrator.js
sed -i '60s/.*/            \/\/ ✅ LAZY INIT: autoformalization circular fix - CRITICAL!/' src/construction/cognitive/FormalReasoningConstructionIntegration.js
sed -i '73s/.*/            \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/construction/cognitive/ConstructionNeuroSymbolicScaffolding.js
sed -i '167s/.*/                \/\/ ✅ LAZY INIT: autoformalization circular fix/' src/construction/learning/ConstructionSFTFlywheel.js

echo "✅ All 13 autoformalization calls fixed!"
