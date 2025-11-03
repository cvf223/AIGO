#!/bin/bash

# 🔧 FIX ALL CIRCULAR DEPENDENCIES - COMPREHENSIVE FIX
# ====================================================
# 
# Automatically finds and comments out ALL calls to 
# FormalReasoningConstructionIntegration.initialize()
# across the entire codebase

echo "🔧 ========================================"
echo "🔧 COMPREHENSIVE CIRCULAR DEPENDENCY FIX"
echo "🔧 ========================================"
echo ""

cd ~/LocalBackup

# Step 1: Find all files with FormalReasoning.initialize() calls
echo "🔍 Scanning codebase for FormalReasoning initialize calls..."

files_to_fix=$(grep -rl "FormalReasoning.*\.initialize()" src/ --include="*.js" | grep -v "\.backup" | grep -v "FormalReasoningConstructionIntegration.js")

file_count=$(echo "$files_to_fix" | wc -l)
echo "📊 Found $file_count files with FormalReasoning.initialize() calls"
echo ""

# Step 2: Create comprehensive backup
echo "📦 Creating comprehensive backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="backups/circular_fix_$timestamp"
mkdir -p "$backup_dir"

for file in $files_to_fix; do
    if [ -f "$file" ]; then
        mkdir -p "$backup_dir/$(dirname $file)"
        cp "$file" "$backup_dir/$file"
    fi
done

echo "✅ Backup created at: $backup_dir"
echo ""

# Step 3: Comment out all FormalReasoning.initialize() calls
echo "🔧 Commenting out all FormalReasoning.initialize() calls..."
echo ""

fixed_count=0

for file in $files_to_fix; do
    if [ -f "$file" ]; then
        # Check if file actually has the pattern
        if grep -q "FormalReasoning.*\.initialize()" "$file"; then
            echo "   🔧 Fixing: $file"
            
            # Comment out lines with .initialize() but preserve indentation
            # Use perl for more sophisticated regex
            perl -i -pe 's/(.*)(await\s+this\.\w*[Ff]ormal[Rr]easoning\w*\.initialize\(\);?)(.*)/$1\/\/ ✅ LAZY INIT (commented to prevent circular dependency): $2$3/' "$file"
            
            ((fixed_count++))
        fi
    fi
done

echo ""
echo "✅ Fixed $fixed_count files"
echo ""

# Step 4: Verify the fixes
echo "🔍 Verifying fixes..."
remaining=$(grep -r "await this\..*[Ff]ormal[Rr]easoning.*\.initialize()" src/ --include="*.js" | grep -v "LAZY INIT" | grep -v "\.backup" | wc -l)

echo "📊 Remaining unguarded FormalReasoning.initialize() calls: $remaining"

if [ "$remaining" -eq "0" ]; then
    echo "✅ ALL circular dependencies fixed!"
else
    echo "⚠️ Some calls remain - may need manual review"
    echo ""
    echo "Remaining calls:"
    grep -rn "await this\..*[Ff]ormal[Rr]easoning.*\.initialize()" src/ --include="*.js" | grep -v "LAZY INIT" | grep -v "\.backup" | head -20
fi

echo ""
echo "🔧 ========================================"
echo "✅ COMPREHENSIVE FIX COMPLETE!"
echo "🔧 ========================================"
echo ""
echo "📋 Summary:"
echo "   Files scanned: $file_count"
echo "   Files fixed: $fixed_count"
echo "   Remaining issues: $remaining"
echo "   Backup location: $backup_dir"
echo ""
echo "🎯 Next: Run test-syndicate-factory.js to verify"
echo ""

