#!/bin/bash

echo "🏗️ COMPREHENSIVE BLOCKCHAIN TO CONSTRUCTION CONVERSION"
echo "======================================================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Counter
FIXED_COUNT=0
TOTAL_FILES=0

echo -e "\n${YELLOW}Phase 1: Identifying all files with blockchain imports...${NC}"
FILES_WITH_IMPORTS=$(grep -r "legendary-arbitrage-syndicate" . --include="*.js" 2>/dev/null | grep -v node_modules | grep -v ".sh:" | cut -d: -f1 | sort -u)
TOTAL_FILES=$(echo "$FILES_WITH_IMPORTS" | wc -l)

echo "Found $TOTAL_FILES files with blockchain imports"

echo -e "\n${YELLOW}Phase 2: Creating replacement mapping...${NC}"

# Define the replacement patterns
cat > REPLACEMENT_MAP.txt << 'EOF'
# Cognitive Systems
s|import { FormalReasoningCognitiveIntegration } from .*FormalReasoningCognitiveIntegration.js.|import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from './src/construction/cognitive/FormalReasoningConstructionIntegration.js';|g
s|import { NeuroSymbolicScaffolding } from .*NeuroSymbolicScaffolding.js.|import { ConstructionNeuroSymbolicScaffolding as NeuroSymbolicScaffolding } from './src/construction/cognitive/ConstructionNeuroSymbolicScaffolding.js';|g
s|import { TradingCognitiveCliffPrevention } from .*TradingCognitiveCliffPrevention.js.|import { ConstructionCognitiveCliffPrevention as TradingCognitiveCliffPrevention } from './src/construction/safety/cognitive/ConstructionCognitiveCliffPrevention.js';|g
s|import { TradingComplexityMonitor.*} from .*TradingComplexityMonitor.js.|import { ConstructionComplexityMonitor as TradingComplexityMonitor, CONSTRUCTION_COMPLEXITY_THRESHOLDS as TRADING_COMPLEXITY_THRESHOLDS } from './src/construction/safety/cognitive/ConstructionComplexityMonitor.js';|g

# Truth Systems
s|import { TradingChainOfKnowledge } from .*TradingChainOfKnowledge.js.|import { ConstructionChainOfKnowledge as TradingChainOfKnowledge } from './src/construction/safety/truth/ConstructionChainOfKnowledge.js';|g
s|import { TradingHallucinationDetector } from .*TradingHallucinationDetector.js.|import { ConstructionHallucinationDetector as TradingHallucinationDetector } from './src/construction/safety/truth/ConstructionHallucinationDetector.js';|g
s|import { RealTimeMarketVerifier } from .*RealTimeMarketVerifier.js.|import { RealTimeConstructionVerifier as RealTimeMarketVerifier } from './src/construction/safety/truth/RealTimeConstructionVerifier.js';|g

# Memory Systems
s|import { SpeedBasedReplaySystem } from .*SpeedBasedReplaySystem.js.|import { SpeedBasedReplaySystem } from './src/construction/safety/memory/ConstructionMemoryPreservation.js';|g
s|import { ElasticWeightConsolidation } from .*ElasticWeightConsolidation.js.|import { ElasticWeightConsolidation } from './src/construction/safety/memory/ConstructionMemoryPreservation.js';|g
s|import { TradingStrategyMemoryPreservation } from .*TradingStrategyMemoryPreservation.js.|import { ConstructionMemoryPreservation as TradingStrategyMemoryPreservation } from './src/construction/safety/memory/ConstructionMemoryPreservation.js';|g

# Coordination Systems
s|import { AgentCoordinationMonitor } from .*AgentCoordinationMonitor.js.|import { AgentCoordinationMonitor } from './src/construction/safety/coordination/ConstructionCoordinationMonitor.js';|g
s|import { IntelligentConflictResolver } from .*IntelligentConflictResolver.js.|import { IntelligentConflictResolver } from './src/construction/safety/coordination/ConstructionCoordinationMonitor.js';|g
s|import { StrategicDeceptionDetectionSystem } from .*StrategicDeceptionDetectionSystem.js.|import { StrategicDeceptionDetectionSystem } from './src/construction/safety/coordination/ConstructionCoordinationMonitor.js';|g

# Verification
s|import { AutoformalizationEngine } from .*AutoformalizationEngine.js.|import { AutoformalizationEngine } from './src/construction/verification/ConstructionAutoformalizationEngine.js';|g

# Prevention Systems
s|import { ProactiveKnowledgeCredibilityPipeline } from .*ProactiveKnowledgeCredibilityPipeline.js.|import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from './src/construction/prevention/ProactiveConstructionKnowledgePipeline.js';|g
s|import { ProactiveInferenceReliabilityEngine } from .*ProactiveInferenceReliabilityEngine.js.|import { ProactiveConstructionInferenceEngine as ProactiveInferenceReliabilityEngine } from './src/construction/prevention/ProactiveConstructionInferenceEngine.js';|g

# Task Systems
s|import { MDPTaskSelectionSystem } from .*MDPTaskSelectionSystem.js.|import { ConstructionMDPTaskSelector as MDPTaskSelectionSystem } from './src/construction/tasks/ConstructionMDPTaskSelector.js';|g

# Learning Systems
s|import { BlockchainExpertiseSystem } from .*BlockchainExpertiseSystem.js.|import { ConstructionExpertiseSystem as BlockchainExpertiseSystem } from './src/construction/learning/ConstructionExpertiseSystem.js';|g

# Factory Systems
s|import { UltimateArbitrageSyndicateFactory } from .*UltimateArbitrageSyndicateFactory.js.|import { ConstructionSyndicateFactory as UltimateArbitrageSyndicateFactory } from './src/construction/factories/ConstructionSyndicateFactory.js';|g

# Remove pure blockchain imports (no construction equivalent needed)
/import.*FlashLoanExecutor.*from.*legendary-arbitrage-syndicate/d
/import.*MoralisStreamConnector.*from.*legendary-arbitrage-syndicate/d
/import.*AlphaGoRLSystem.*from.*legendary-arbitrage-syndicate/d
/import.*ProactiveVeracityJudgeService.*from.*legendary-arbitrage-syndicate/d
/import.*ProactiveCognitiveMetabolicLoop.*from.*legendary-arbitrage-syndicate/d
/import.*SFTFlywheelGovernor.*from.*legendary-arbitrage-syndicate/d
EOF

echo -e "  ${GREEN}✅${NC} Replacement map created"

echo -e "\n${YELLOW}Phase 3: Fixing imports in each file...${NC}"

for FILE in $FILES_WITH_IMPORTS; do
    if [ -f "$FILE" ]; then
        echo -n "  Fixing: $FILE... "
        
        # Get the relative path from the file's directory to root
        FILE_DIR=$(dirname "$FILE")
        DEPTH=$(echo "$FILE_DIR" | tr '/' '\n' | wc -l)
        
        # Create appropriate relative path prefix
        if [ "$DEPTH" -eq 1 ] && [ "$FILE_DIR" != "." ]; then
            PREFIX="../"
        elif [ "$DEPTH" -eq 2 ]; then
            PREFIX="../../"
        elif [ "$DEPTH" -eq 3 ]; then
            PREFIX="../../../"
        elif [ "$FILE_DIR" == "." ]; then
            PREFIX="./"
        else
            PREFIX="./"
        fi
        
        # Create temporary replacement map with correct paths
        sed "s|\./src/|${PREFIX}src/|g" REPLACEMENT_MAP.txt > TEMP_MAP.txt
        
        # Apply replacements
        cp "$FILE" "$FILE.backup"
        sed -f TEMP_MAP.txt "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
        
        # Check if file still has blockchain imports
        if grep -q "legendary-arbitrage-syndicate" "$FILE"; then
            echo -e "${RED}⚠️ Still has imports${NC}"
        else
            echo -e "${GREEN}✅${NC}"
            ((FIXED_COUNT++))
        fi
    fi
done

# Cleanup
rm -f REPLACEMENT_MAP.txt TEMP_MAP.txt

echo -e "\n${YELLOW}Phase 4: Summary${NC}"
echo "======================================="
echo -e "${GREEN}Fixed $FIXED_COUNT out of $TOTAL_FILES files${NC}"

# Check for remaining imports
echo -e "\n${YELLOW}Checking for remaining blockchain imports...${NC}"
REMAINING=$(grep -r "legendary-arbitrage-syndicate" . --include="*.js" 2>/dev/null | grep -v node_modules | grep -v ".sh:" | grep -v ".backup" | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo -e "${GREEN}✅ ALL BLOCKCHAIN IMPORTS HAVE BEEN CONVERTED!${NC}"
else
    echo -e "${YELLOW}⚠️ $REMAINING imports still remain${NC}"
    echo "Remaining imports:"
    grep -r "legendary-arbitrage-syndicate" . --include="*.js" 2>/dev/null | grep -v node_modules | grep -v ".sh:" | grep -v ".backup" | head -10
fi

echo -e "\n${GREEN}🏗️ CONSTRUCTION CONVERSION COMPLETE!${NC}"
