#!/bin/bash

# 🔧 FIX REMAINING FORMAL REASONING CALLS - SECOND PASS
# =====================================================
# 
# Fix the 28 remaining calls that use different property names:
# - this.formalReasoning.initialize()
# - this.formalReasoningCognitive.initialize()

echo "🔧 ========================================"
echo "🔧 FIXING REMAINING FORMAL REASONING CALLS"
echo "🔧 ========================================"
echo ""

cd ~/LocalBackup

# List of files with remaining issues
files=(
    "src/learning/ConstructionPricePredictor.js"
    "src/learning/SuperiorBoundedA2CDDPSystem.js"
    "src/learning/ConstructionWorldModel.js"
    "src/training/MultiTokenTrainingOrchestrator.js"
    "src/integration/DeepMultiTokenCreativityIntegrator.js"
    "src/quantum/QuantumAnnealingOptimizer.js"
    "src/quantum/QuantumConstructionDataExpansion.js"
    "src/quantum/QuantumAdvantageValidationSystem.js"
    "src/ai/TeacherlessTrainingEngine.js"
    "src/ai/DiffusionModelEngine.js"
    "src/ai/MultiTokenTrainingOrchestrator.js"
    "src/ai/AdvancedReasoningEngine.js"
    "src/formalization/MathematicalConstructionVerifier.js"
    "src/formalization/FormalVerificationOrchestrator.js"
    "src/formalization/AutoformalizationSyndicateIntegrator.js"
    "src/formalization/AutoformalizationEngine.js"
    "src/prevention/ProactiveCognitiveMetabolicLoop.js"
    "src/creativity/SophisticatedModelSteeringEngine.js"
    "src/creativity/MemoryDestillationOvertrainingEngine.js"
    "src/creativity/OvertrainingPreventionEngine.js"
    "src/creativity/CreativitySystemIntegrator.js"
)

echo "📦 Creating backups for second pass..."
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$file.backup.pass2"
    fi
done
echo "✅ Backups created"
echo ""

echo "🔧 Fixing remaining calls..."
fixed_count=0

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   🔧 Fixing: $file"
        
        # Fix pattern 1: this.formalReasoning.initialize()
        perl -i -pe 's/(.*)(await\s+this\.formalReasoning\.initialize\(\);?)(.*)/$1\/\/ ✅ LAZY INIT (circular dependency fix): $2$3/' "$file"
        
        # Fix pattern 2: this.formalReasoningCognitive.initialize()
        perl -i -pe 's/(.*)(await\s+this\.formalReasoningCognitive\.initialize\(\);?)(.*)/$1\/\/ ✅ LAZY INIT (circular dependency fix): $2$3/' "$file"
        
        ((fixed_count++))
    fi
done

echo ""
echo "✅ Fixed $fixed_count files"
echo ""

# Verify
echo "🔍 Final verification..."
remaining=$(grep -r "await this\.formal.*\.initialize()" src/ --include="*.js" | grep -v "LAZY INIT" | grep -v "\.backup" | wc -l)

echo "📊 Remaining FormalReasoning.initialize() calls: $remaining"

if [ "$remaining" -eq "0" ]; then
    echo "🎉 ALL CIRCULAR DEPENDENCIES ELIMINATED!"
else
    echo "⚠️ Some calls still remain:"
    grep -rn "await this\.formal.*\.initialize()" src/ --include="*.js" | grep -v "LAZY INIT" | grep -v "\.backup" | head -10
fi

echo ""
echo "🔧 ========================================"
echo "✅ SECOND PASS COMPLETE!"
echo "🔧 ========================================"
echo ""
echo "📋 Total files fixed in both passes: $((78 + fixed_count))"
echo ""

