#!/bin/bash

echo "🔍 Finding and fixing ALL remaining blockchain imports in construction services..."

# Find all files with the old import
FILES=$(grep -r "legendary-arbitrage-syndicate" src/construction/ 2>/dev/null | cut -d: -f1 | sort -u)

if [ -z "$FILES" ]; then
    echo "✅ No blockchain imports found in construction services"
else
    echo "Found files with blockchain imports:"
    echo "$FILES"
    echo ""
    
    for FILE in $FILES; do
        echo "🔧 Fixing: $FILE"
        
        # Replace the import
        sed -i 's|import { FormalReasoningCognitiveIntegration } from .*/FormalReasoningCognitiveIntegration.js.;|import { FormalReasoningConstructionIntegration } from '"'"'../cognitive/FormalReasoningConstructionIntegration.js'"'"';|g' "$FILE"
        
        # Replace the class instantiation
        sed -i 's|new FormalReasoningCognitiveIntegration|new FormalReasoningConstructionIntegration|g' "$FILE"
        
        echo "   ✅ Fixed"
    done
fi

echo ""
echo "✅ All blockchain imports fixed!"
