#!/bin/bash

# 📥 SERVER: Pull changes from local machine
# ==========================================

LOCAL_USER="epicbattlegods"
LOCAL_HOST="YOUR_LOCAL_IP"  # Update this!
LOCAL_PATH="/Users/epicbattlegods/Desktop/Multi-Agent-AI-Framework/ServerData"
SERVER_PATH="~/ProductionCode"

echo "📥 PULLING CHANGES FROM LOCAL MACHINE"
echo "====================================="
echo ""
echo "Local: ${LOCAL_USER}@${LOCAL_HOST}:${LOCAL_PATH}"
echo "Server: ${SERVER_PATH}"
echo ""

# Backup before pulling
BACKUP_NAME="pre-pull-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p backups
tar -czf backups/${BACKUP_NAME}.tar.gz src/ --exclude='node_modules' 2>/dev/null || true
echo "✅ Backup created: backups/${BACKUP_NAME}.tar.gz"
echo ""

echo "📥 Syncing from local..."

rsync -avz \
    --progress \
    --exclude='node_modules/' \
    --exclude='.git/' \
    --exclude='*.log' \
    --exclude='uploads/*' \
    --exclude='backups/*' \
    --exclude='.mirror_initialized' \
    --exclude='.last_mirror_*' \
    ${LOCAL_USER}@${LOCAL_HOST}:${LOCAL_PATH}/ \
    ${SERVER_PATH}/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Pull complete!"
    echo "   Updated: $(date)"
    echo ""
    echo "⚠️  Restart server to apply changes:"
    echo "   pm2 restart construction-ai"
else
    echo ""
    echo "❌ Pull failed!"
fi
