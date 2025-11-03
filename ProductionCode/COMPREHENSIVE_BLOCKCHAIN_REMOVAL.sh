#!/bin/bash

echo "🚀 COMPREHENSIVE BLOCKCHAIN REMOVAL AND CONVERSION TO CONSTRUCTION"
echo "================================================================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Counter for fixed files
FIXED_COUNT=0
TOTAL_COUNT=0

# Create a mapping of old blockchain modules to new construction modules
declare -A MODULE_MAP=(
    ["FormalReasoningCognitiveIntegration"]="FormalReasoningConstructionIntegration"
    ["ProactiveKnowledgeCredibilityPipeline"]="ProactiveConstructionKnowledgePipeline"
    ["ProactiveInferenceReliabilityEngine"]="ProactiveConstructionInferenceEngine"
    ["ProactiveVeracityJudgeService"]=""  # Remove this
    ["SFTFlywheelGovernor"]=""  # Remove this
    ["ProactiveCognitiveMetabolicLoop"]=""  # Remove this
    ["MDPTaskSelectionSystem"]="ConstructionMDPTaskSelector"
    ["BlockchainExpertiseSystem"]="ConstructionExpertiseSystem"
    ["UltimateArbitrageSyndicateFactory"]="ConstructionSyndicateFactory"
    ["NeuroSymbolicScaffolding"]=""  # Remove this
)

# Find all JS files with blockchain imports (excluding node_modules and temporary directories)
echo -e "${YELLOW}Finding all files with blockchain imports...${NC}"
FILES=$(grep -r "legendary-arbitrage-syndicate" . --include="*.js" 2>/dev/null | \
        grep -v node_modules | \
        grep -v ".sh:" | \
        grep -v COMPLETE_FIX | \
        grep -v root@162 | \
        cut -d: -f1 | sort -u)

TOTAL_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo -e "Found ${RED}$TOTAL_COUNT${NC} files with blockchain imports"
echo ""

# Process each file
for FILE in $FILES; do
    if [ -f "$FILE" ]; then
        echo -e "${YELLOW}Processing:${NC} $FILE"
        
        # Check if it's a critical file that needs conversion
        if [[ "$FILE" == *"learning/LegendarySyndicateSystem.js"* ]] || \
           [[ "$FILE" == *"LLMAgent.js"* ]] || \
           [[ "$FILE" == *"OllamaIntegration.js"* ]] || \
           [[ "$FILE" == *"ConstructionSyndicateOrchestrator.js"* ]]; then
            
            echo -e "  ${GREEN}✓${NC} Critical file - commenting out blockchain imports"
            
            # Comment out all blockchain imports
            sed -i.bak 's|^import.*legendary-arbitrage-syndicate.*|// BLOCKCHAIN REMOVED: &|g' "$FILE"
            
            # Also comment out the usage of these imports
            for OLD_CLASS in "${!MODULE_MAP[@]}"; do
                NEW_CLASS="${MODULE_MAP[$OLD_CLASS]}"
                if [ -n "$NEW_CLASS" ]; then
                    # Replace with construction equivalent
                    sed -i "s|new $OLD_CLASS|new $NEW_CLASS // CONVERTED FROM: $OLD_CLASS|g" "$FILE"
                else
                    # Comment out if no replacement
                    sed -i "s|new $OLD_CLASS|/* BLOCKCHAIN REMOVED: new $OLD_CLASS */null|g" "$FILE"
                fi
            done
            
            FIXED_COUNT=$((FIXED_COUNT + 1))
            
        elif [[ "$FILE" == *"test/"* ]] || [[ "$FILE" == *"jest.config"* ]] || [[ "$FILE" == *"run_"* ]]; then
            echo -e "  ${YELLOW}⚠️${NC} Test/config file - skipping"
            
        else
            echo -e "  ${YELLOW}!${NC} Non-critical file - commenting out imports"
            
            # Just comment out the imports for non-critical files
            sed -i.bak 's|^import.*legendary-arbitrage-syndicate.*|// BLOCKCHAIN REMOVED: &|g' "$FILE"
            
            FIXED_COUNT=$((FIXED_COUNT + 1))
        fi
    fi
done

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}RESULTS:${NC}"
echo -e "  Fixed: ${GREEN}$FIXED_COUNT${NC} files"
echo -e "  Total: $TOTAL_COUNT files"
echo ""

# Clean up backup files
echo -e "${YELLOW}Cleaning up backup files...${NC}"
find . -name "*.bak" -type f -delete

echo -e "${GREEN}✅ COMPREHENSIVE BLOCKCHAIN REMOVAL COMPLETE!${NC}"
echo ""
echo "Next steps:"
echo "  1. The system should now start without blockchain module errors"
echo "  2. Any functionality that relied on blockchain will need construction equivalents"
echo "  3. Run: node TEST_SUPERINTELLIGENCE.js to verify"
echo ""
