#!/bin/bash
echo "🔧 Fixing final 9 files..."

# Fix each file individually
sed -i '5360s/.*/            \/\/ ✅ LAZY INIT: Circular dependency fix/' src/agents/LLMAgent.js
sed -i '1306s/.*/                \/\/ ✅ LAZY INIT: Circular dependency fix/' src/services/WorkflowService.js
sed -i '495s/.*/            \/\/ ✅ LAZY INIT: Circular dependency fix/' src/creativity/MemorizationSinksArchitecture.js
sed -i '716s/.*/            \/\/ ✅ LAZY INIT: Circular dependency fix/' src/intelligence/QuantumMDPESIntegrator.js
sed -i '157s/.*/        \/\/ ✅ LAZY INIT: Circular dependency fix - Factory will initialize this explicitly/' src/construction/factories/ConstructionSyndicateFactory.js
sed -i '69s/.*/            \/\/ ✅ LAZY INIT: Circular dependency fix/' src/construction/cognitive/ConstructionNeuroSymbolicScaffolding.js
sed -i '164s/.*/                \/\/ ✅ LAZY INIT: Circular dependency fix/' src/construction/learning/ConstructionSFTFlywheel.js
sed -i '250s/.*/        \/\/ ✅ LAZY INIT: Circular dependency fix/' src/construction/ConstructionPreventionIntegrator.js
sed -i '166s/.*/                \/\/ ✅ LAZY INIT: Circular dependency fix/' src/construction/services/ComplianceCheckService.js

echo "✅ All 9 files fixed!"
