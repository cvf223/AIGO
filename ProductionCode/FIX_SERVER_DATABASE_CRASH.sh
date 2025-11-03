#!/bin/bash

echo "========================================="
echo "🔧 FIXING SERVER DATABASE CRASH"
echo "========================================="
echo ""

SERVER="root@162.55.83.33"
DEPLOY_PATH="~/deployment_package_20251016_074413/codebase"

echo "📊 Issue: Server has old startfullsyndicate.js with premature database check"
echo "✅ Fix: Remove the check that runs before database init"
echo ""

# Connect to server and fix the issue
ssh $SERVER << 'ENDSSH'
cd ~/deployment_package_20251016_074413/codebase

echo "🔍 Current problematic code at end of startfullsyndicate.js:"
echo "---"
tail -10 startfullsyndicate.js | grep -A 5 "GLOBAL DATABASE"
echo "---"
echo ""

echo "🔧 Creating backup..."
cp startfullsyndicate.js startfullsyndicate.js.backup_$(date +%Y%m%d_%H%M%S)

echo "✅ Backup created"
echo ""

echo "🔧 Removing premature database check..."

# Remove the problematic check that runs at module load time
cat > /tmp/fix_script.sed << 'EOF'
/^\/\/ GLOBAL DATABASE POOL - NO FALLBACKS!$/,/^}$/d
EOF

sed -i -f /tmp/fix_script.sed startfullsyndicate.js

echo "✅ Removed problematic database check"
echo ""

echo "🔍 Verifying fix..."
if grep -q "GLOBAL DATABASE POOL - NO FALLBACKS" startfullsyndicate.js; then
    echo "❌ Check still exists - manual fix needed"
    exit 1
else
    echo "✅ Check successfully removed!"
fi

echo ""
echo "📄 New end of file:"
echo "---"
tail -15 startfullsyndicate.js
echo "---"

ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ SERVER FIX APPLIED SUCCESSFULLY!"
    echo "========================================="
    echo ""
    echo "🎯 What was fixed:"
    echo "  • Removed premature global.dbPool check"
    echo "  • Database now initializes properly in main()"
    echo "  • No more early exit before initialization"
    echo ""
    echo "🚀 Ready to launch!"
    echo ""
    echo "Test it with:"
    echo "  ssh $SERVER 'cd $DEPLOY_PATH && ./launch-production.sh'"
else
    echo ""
    echo "❌ Fix failed - manual intervention needed"
fi

