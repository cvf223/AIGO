#!/bin/bash

# 📤 SERVER: Push changes to local machine
# ========================================

LOCAL_USER="epicbattlegods"
LOCAL_HOST="YOUR_LOCAL_IP"  # Update this!
LOCAL_PATH="/Users/epicbattlegods/Desktop/Multi-Agent-AI-Framework/ServerData"
SERVER_PATH="~/ProductionCode"

echo "📤 PUSHING CHANGES TO LOCAL MACHINE"
echo "==================================="
echo ""
echo "Server: ${SERVER_PATH}"
echo "Local: ${LOCAL_USER}@${LOCAL_HOST}:${LOCAL_PATH}"
echo ""

echo "📤 Syncing to local..."

rsync -avz \
    --progress \
    --delete \
    --exclude='node_modules/' \
    --exclude='.git/' \
    --exclude='*.log' \
    --exclude='uploads/*' \
    --exclude='backups/*' \
    --exclude='deployment-packages/*.tar.gz' \
    --exclude='data/transaction-tracking.json' \
    --exclude='nohup.out' \
    --exclude='server.log' \
    ${SERVER_PATH}/ \
    ${LOCAL_USER}@${LOCAL_HOST}:${LOCAL_PATH}/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push complete!"
    echo "   Updated: $(date)"
else
    echo ""
    echo "❌ Push failed!"
fi
