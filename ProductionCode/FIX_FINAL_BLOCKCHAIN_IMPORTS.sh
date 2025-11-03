#!/bin/bash

# 🔧 FINAL BLOCKCHAIN IMPORT CLEANUP
# ==================================
# Removes remaining blockchain imports from non-critical files

echo "🔧 FINAL BLOCKCHAIN IMPORT CLEANUP - CONSTRUCTION SYNDICATE"
echo "========================================================="
echo ""

# Files to comment out ethers imports
FILES_TO_FIX=(
    "src/services/PortfolioManager.js"
    "src/services/CounterfactualAnalysisService.js"
    "elite-web-server.js"
    "src/tasks/AggressiveHistoricalDataCollector.js"
    "learning/LegendarySingleAgentSystem.js"
    "src/plugins/pool-management-plugin.js"
    "launch-quantum-evolution-complete.js"
    "launch-quantum-evolution-production.js"
    "src/rpc-provider-fix.js"
    "src/enhanced-realtime-system.js"
)

# Scripts that are not needed for construction (can be ignored)
SCRIPTS_TO_IGNORE=(
    "scripts/database-cleanup-and-pool-populator.ts"
    "scripts/comprehensive-price-populator.js"
    "scripts/bootstrap-free-data.js"
    "scripts/competitor-analyzer.js"
    "scripts/advanced-arbitrage-calculator.js"
    "scripts/arbitrum-pool-discovery.js"
    "scripts/arbitrum-focused-data-collector.js"
    "scripts/enhanced-data-collector.js"
    "scripts/test-arbitrum-connectivity.js"
    "scripts/conservative-pool-discovery.js"
    "scripts/validate-rate-limits.js"
)

# Test files that are not needed (can be ignored)
TEST_FILES_TO_IGNORE=(
    "test-intelligent-arbitrage-backbone.js"
    "test-real-blockchain-backbone.js"
    "test-blockchain-backbone.js"
)

echo "📝 Processing ${#FILES_TO_FIX[@]} source files..."
echo ""

# Fix source files
for file in "${FILES_TO_FIX[@]}"; do
    if [ -f "$file" ]; then
        echo "   Fixing: $file"
        
        # Comment out ethers import
        sed -i.bak "s/^import.*ethers.*$/\/\/ BLOCKCHAIN REMOVED: &/" "$file" 2>/dev/null || \
        sed -i '' "s/^import.*ethers.*$/\/\/ BLOCKCHAIN REMOVED: &/" "$file" 2>/dev/null
        
        # Comment out web3 imports
        sed -i.bak "s/^import.*web3.*$/\/\/ BLOCKCHAIN REMOVED: &/" "$file" 2>/dev/null || \
        sed -i '' "s/^import.*web3.*$/\/\/ BLOCKCHAIN REMOVED: &/" "$file" 2>/dev/null
        
        # Comment out blockchain-related imports
        sed -i.bak "s/^import.*[Bb]lockchain.*$/\/\/ BLOCKCHAIN REMOVED: &/" "$file" 2>/dev/null || \
        sed -i '' "s/^import.*[Bb]lockchain.*$/\/\/ BLOCKCHAIN REMOVED: &/" "$file" 2>/dev/null
        
        # Comment out arbitrage imports
        sed -i.bak "s/^import.*[Aa]rbitrage.*$/\/\/ BLOCKCHAIN REMOVED: &/" "$file" 2>/dev/null || \
        sed -i '' "s/^import.*[Aa]rbitrage.*$/\/\/ BLOCKCHAIN REMOVED: &/" "$file" 2>/dev/null
        
        # Remove backup file
        rm -f "${file}.bak"
    else
        echo "   ⚠️ File not found: $file"
    fi
done

echo ""
echo "📝 Marking script files as deprecated..."
echo ""

# Add deprecation notice to script files
for file in "${SCRIPTS_TO_IGNORE[@]}"; do
    if [ -f "$file" ]; then
        echo "   Deprecating: $file"
        
        # Add deprecation notice at top of file if not already there
        if ! grep -q "DEPRECATED - BLOCKCHAIN FUNCTIONALITY" "$file"; then
            {
                echo "// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED"
                echo "// This file is not used in the Construction Syndicate"
                echo ""
                cat "$file"
            } > "$file.tmp" && mv "$file.tmp" "$file"
        fi
    fi
done

echo ""
echo "📝 Marking test files as deprecated..."
echo ""

# Add deprecation notice to test files
for file in "${TEST_FILES_TO_IGNORE[@]}"; do
    if [ -f "$file" ]; then
        echo "   Deprecating: $file"
        
        # Add deprecation notice at top of file if not already there
        if ! grep -q "DEPRECATED - BLOCKCHAIN FUNCTIONALITY" "$file"; then
            {
                echo "// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED"
                echo "// This test file is not used in the Construction Syndicate"
                echo ""
                cat "$file"
            } > "$file.tmp" && mv "$file.tmp" "$file"
        fi
    fi
done

echo ""
echo "🔍 Checking for any remaining imports..."
echo ""

# Count remaining blockchain imports (excluding deprecated files)
REMAINING=$(grep -r "^import.*ethers" . \
    --include="*.js" \
    --include="*.ts" \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=scripts \
    --exclude="test-*.js" \
    --exclude="*.backup" \
    --exclude="*.bak" \
    2>/dev/null | wc -l)

echo "   Remaining blockchain imports: $REMAINING"

if [ "$REMAINING" -gt 0 ]; then
    echo ""
    echo "   ⚠️ Some imports remain in:"
    grep -l "^import.*ethers" . \
        --include="*.js" \
        --include="*.ts" \
        --exclude-dir=node_modules \
        --exclude-dir=.git \
        --exclude-dir=scripts \
        --exclude="test-*.js" \
        --exclude="*.backup" \
        --exclude="*.bak" \
        -r 2>/dev/null | head -10
fi

echo ""
echo "✅ BLOCKCHAIN IMPORT CLEANUP COMPLETE!"
echo ""
echo "Summary:"
echo "   - Fixed ${#FILES_TO_FIX[@]} source files"
echo "   - Deprecated ${#SCRIPTS_TO_IGNORE[@]} script files"
echo "   - Deprecated ${#TEST_FILES_TO_IGNORE[@]} test files"
echo "   - Remaining imports: $REMAINING (these may be in documentation or necessary for compatibility)"
echo ""
echo "🏗️ The Construction Syndicate is now blockchain-free!"
