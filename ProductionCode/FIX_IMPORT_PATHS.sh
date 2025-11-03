#!/bin/bash

echo "🔧 Fixing incorrect import paths..."

# Fix paths in src/core/ (should be ../construction)
find src/core -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/services/ (should be ../construction)  
find src/services -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/llm/ (should be ../construction)
find src/llm -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/ai/ (should be ../construction)
find src/ai -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/analysis/ (should be ../construction)
find src/analysis -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/quantum/ (should be ../construction)
find src/quantum -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/memory/ (should be ../construction)
find src/memory -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/worldmodel/ (should be ../construction)
find src/worldmodel -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/alphago-elite/ (should be ../../construction)
find src/alphago-elite -name "*.js" -exec sed -i 's|../../../src/construction|../../construction|g' {} \;

# Fix paths in src/formalization/ (should be ../construction)
find src/formalization -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/creativity/ (should be ../construction)
find src/creativity -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/reasoning/ (should be ../construction)
find src/reasoning -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/constitution/ (should be ../construction)
find src/constitution -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/integration/ (should be ../construction)
find src/integration -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/intelligence/ (should be ../construction)
find src/intelligence -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/workflows/ (should be ../construction)
find src/workflows -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/planning/ (should be ../construction)
find src/planning -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/research/ (should be ../construction)
find src/research -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/training/ (should be ../construction)
find src/training -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/learning/ (should be ../construction)
find src/learning -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Fix paths in src/agents/ (should be ../construction)
find src/agents -name "*.js" -exec sed -i 's|../../../src/construction|../construction|g' {} \;

# Also fix double semicolons
find src -name "*.js" -exec sed -i 's/;;/;/g' {} \;

# Fix paths in learning/ directory (should be ../src/construction)
find learning -name "*.js" -exec sed -i 's|../../../src/construction|../src/construction|g' {} \;
find learning -name "*.js" -exec sed -i 's|\./src/construction|../src/construction|g' {} \;

# Fix paths in root level files (should be ./src/construction)
sed -i 's|../../../src/construction|./src/construction|g' *.js 2>/dev/null || true

echo "✅ Import paths fixed!"

# Check if any incorrect paths remain
REMAINING=$(grep -r "../../../src/construction" . --include="*.js" 2>/dev/null | grep -v node_modules | wc -l)
echo "Remaining incorrect paths: $REMAINING"
