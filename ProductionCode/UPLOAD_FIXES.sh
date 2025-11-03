#!/bin/bash

# 🚀 UPLOAD ALL PRODUCTION FIXES TO SERVER
# ========================================

SERVER="root@162.55.83.33"
REMOTE_DIR="/root/deployment_package_20251016_074413/codebase"

echo "📤 UPLOADING PRODUCTION FIXES TO SERVER..."
echo "=========================================="

# Upload new/modified files
echo "📁 Uploading database fixes..."
scp src/database/DatabaseConnectionManager.js $SERVER:$REMOTE_DIR/src/database/
scp src/database/UnifiedDatabaseConfig.js $SERVER:$REMOTE_DIR/src/database/

echo "📁 Uploading TensorFlow patches..."
scp src/patches/TensorFlowAPIPatch.js $SERVER:$REMOTE_DIR/src/patches/

echo "📁 Uploading background task manager..."
scp src/utils/BackgroundTaskManager.js $SERVER:$REMOTE_DIR/src/utils/

echo "📁 Uploading launcher scripts..."
scp launch-production.sh $SERVER:$REMOTE_DIR/
ssh $SERVER "chmod +x $REMOTE_DIR/launch-production.sh"

echo "📁 Uploading database initialization..."
scp scripts/initialize-production-database.js $SERVER:$REMOTE_DIR/scripts/
ssh $SERVER "chmod +x $REMOTE_DIR/scripts/initialize-production-database.js"

echo "📁 Uploading updated startup file..."
scp startfullsyndicate.js $SERVER:$REMOTE_DIR/

echo ""
echo "✅ ALL FILES UPLOADED!"
echo ""
echo "🎯 NEXT STEPS ON SERVER:"
echo "========================"
echo ""
echo "1️⃣ Initialize database:"
echo "   cd ~/deployment_package_20251016_074413/codebase"
echo "   node scripts/initialize-production-database.js --seed"
echo ""
echo "2️⃣ Launch with production settings:"
echo "   ./launch-production.sh"
echo ""
echo "3️⃣ Or use existing launcher with heap config:"
echo "   ./launch-construction-syndicate.sh"
echo ""
echo "🔍 Monitor logs for:"
echo "   - Database connection success"
echo "   - TensorFlow APIs patched"
echo "   - Background tasks delayed until ready"
echo "   - No authentication errors"
