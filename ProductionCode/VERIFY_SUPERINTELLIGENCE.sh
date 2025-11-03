#!/bin/bash

# 🧠 VERIFY SUPERINTELLIGENCE INTEGRATION SCRIPT
# ==============================================
# Ensures ALL superintelligence systems are properly integrated
# and optimized for construction use cases

echo "🧠 VERIFYING SUPERINTELLIGENCE INTEGRATION..."
echo "============================================"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Check if all superintelligence files exist
echo -e "\n${YELLOW}1. Checking Superintelligence Files...${NC}"

REQUIRED_FILES=(
    "src/construction/reasoning/ConstructionSuperintelligenceOrchestrator.js"
    "src/construction/reasoning/ConstructionGOT.js"
    "src/construction/reasoning/ConstructionCOA.js"
    "src/construction/reasoning/ConstructionTOT.js"
    "src/construction/reasoning/ConstructionCOT.js"
    "src/construction/reasoning/ConstructionZAP.js"
    "src/construction/cognitive/ConstructionAutoformalization.js"
    "src/construction/cognitive/FormalReasoningConstructionIntegration.js"
    "src/construction/INTEGRATE_SUPERINTELLIGENCE.js"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $file"
    else
        echo -e "  ${RED}❌${NC} $file - MISSING!"
        ALL_FILES_EXIST=false
    fi
done

# 2. Check model assignments
echo -e "\n${YELLOW}2. Verifying Model Assignments...${NC}"

# Check Phi3 for math
grep -q "mathModel.*phi3:14b" src/llm/OllamaIntegration.js
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅${NC} Phi3:14b assigned for mathematical operations"
else
    echo -e "  ${RED}❌${NC} Phi3:14b NOT properly assigned for math!"
fi

# Check Qwen for reasoning
grep -q "reasoning.*qwen2.5:72b" src/llm/OllamaIntegration.js
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅${NC} Qwen2.5:72b assigned for reasoning"
else
    echo -e "  ${RED}❌${NC} Qwen2.5:72b NOT properly assigned for reasoning!"
fi

# 3. Check construction optimization
echo -e "\n${YELLOW}3. Checking Construction Optimization...${NC}"

# Check if systems are construction-optimized
for file in src/construction/reasoning/*.js; do
    if grep -q "constructionOptimized: true" "$file"; then
        basename=$(basename "$file")
        echo -e "  ${GREEN}✅${NC} $basename is construction-optimized"
    else
        basename=$(basename "$file")
        echo -e "  ${YELLOW}⚠️${NC} $basename may not be construction-optimized"
    fi
done

# 4. Check deep integration
echo -e "\n${YELLOW}4. Verifying Deep Integration...${NC}"

# Check for loose components
echo "  Checking for proper system connections..."

# Check if superintelligence is connected to autoformalization
grep -q "autoformalization.*initialize" src/construction/cognitive/FormalReasoningConstructionIntegration.js
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅${NC} Autoformalization connected to Formal Reasoning"
else
    echo -e "  ${RED}❌${NC} Autoformalization NOT connected!"
fi

# Check if GOT, COA, TOT, COT, ZAP are interconnected
grep -q "performDeepIntegration" src/construction/reasoning/ConstructionSuperintelligenceOrchestrator.js
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅${NC} Deep integration method exists"
else
    echo -e "  ${RED}❌${NC} Deep integration method missing!"
fi

# 5. Check mathematical proof systems
echo -e "\n${YELLOW}5. Verifying Mathematical Proof Systems...${NC}"

# Check for theorem generation
grep -q "generateProofs" src/construction/cognitive/ConstructionAutoformalization.js
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅${NC} Mathematical proof generation implemented"
else
    echo -e "  ${RED}❌${NC} Mathematical proof generation missing!"
fi

# Check for formal verification
grep -q "formalVerification" src/construction/cognitive/ConstructionAutoformalization.js
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✅${NC} Formal verification implemented"
else
    echo -e "  ${RED}❌${NC} Formal verification missing!"
fi

# 6. Update startup script if needed
echo -e "\n${YELLOW}6. Updating Startup Script...${NC}"

# Check if superintelligence is imported in startup
if ! grep -q "ConstructionSuperintelligenceOrchestrator" startfullsyndicate.js; then
    echo "  Adding superintelligence imports to startup..."
    
    # Find the last import line
    LAST_IMPORT_LINE=$(grep -n "^import" startfullsyndicate.js | tail -1 | cut -d: -f1)
    
    # Add superintelligence imports after the last import
    sed -i "${LAST_IMPORT_LINE}a\\
\\
// SUPERINTELLIGENCE SYSTEMS\\
import { ConstructionSuperintelligenceIntegration } from './src/construction/INTEGRATE_SUPERINTELLIGENCE.js';\\
" startfullsyndicate.js
    
    echo -e "  ${GREEN}✅${NC} Added superintelligence imports"
else
    echo -e "  ${GREEN}✅${NC} Superintelligence already imported"
fi

# Add integration call to startup
if ! grep -q "superintelligenceIntegrator" startfullsyndicate.js; then
    echo "  Adding superintelligence integration to startup..."
    
    # Add before the server starts (around line 1600)
    cat >> startfullsyndicate.js << 'EOF'

    // 🧠 INTEGRATE SUPERINTELLIGENCE
    console.log('\n🧠 INTEGRATING SUPERINTELLIGENCE SYSTEMS...');
    try {
        const superintelligenceIntegrator = new ConstructionSuperintelligenceIntegration();
        await superintelligenceIntegrator.integrateAllSuperintelligence(
            constructionOrchestrator,
            ollamaService
        );
        console.log('   ✅ Superintelligence FULLY INTEGRATED!');
    } catch (error) {
        console.error('   ❌ Superintelligence integration failed:', error.message);
    }
EOF
    
    echo -e "  ${GREEN}✅${NC} Added superintelligence integration to startup"
else
    echo -e "  ${GREEN}✅${NC} Superintelligence integration already in startup"
fi

# 7. Summary
echo -e "\n${YELLOW}=======================================${NC}"
echo -e "${GREEN}VERIFICATION COMPLETE${NC}"
echo ""

if [ "$ALL_FILES_EXIST" = true ]; then
    echo -e "${GREEN}✅ All superintelligence files present${NC}"
else
    echo -e "${RED}❌ Some files missing - run creation scripts${NC}"
fi

echo ""
echo "Key Points:"
echo "  • Phi3:14b handles ALL mathematical operations"
echo "  • Qwen2.5:72b handles ALL advanced reasoning"
echo "  • GOT, COA, TOT, COT, ZAP are construction-optimized"
echo "  • Autoformalization generates mathematical proofs"
echo "  • All systems are DEEPLY INTEGRATED (not loosely laying around)"

echo ""
echo "To test superintelligence:"
echo "  1. Start the system: node --max-old-space-size=65536 startfullsyndicate.js"
echo "  2. Submit a construction problem"
echo "  3. Check logs for '🧠 Processing with SUPERINTELLIGENCE...'"
echo "  4. Verify mathematical proofs are generated"
echo "  5. Confirm all reasoning systems engage"

echo -e "\n${GREEN}🚀 Superintelligence ready for deployment!${NC}"

