#!/bin/bash

echo "========================================="
echo "🚀 SIMPLE DEPLOYMENT TO SERVER"
echo "========================================="

SERVER="root@162.55.83.33"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE="codebase_${TIMESTAMP}.tar.gz"

echo ""
echo "📦 Step 1: Creating archive..."
tar -czf "/tmp/${ARCHIVE}" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.cursor' \
    .

SIZE=$(du -h "/tmp/${ARCHIVE}" | cut -f1)
echo "   ✅ Archive created: $SIZE"

echo ""
echo "📤 Step 2: Uploading to server..."
scp "/tmp/${ARCHIVE}" "${SERVER}:/tmp/"

if [ $? -ne 0 ]; then
    echo "   ❌ Upload failed!"
    rm -f "/tmp/${ARCHIVE}"
    exit 1
fi

echo "   ✅ Upload complete"

echo ""
echo "📂 Step 3: Extracting on server..."
ssh $SERVER "cd ~ && mkdir -p deployment_${TIMESTAMP} && tar -xzf /tmp/${ARCHIVE} -C deployment_${TIMESTAMP}/ && rm -f /tmp/${ARCHIVE} && rm -f latest_deployment && ln -sf deployment_${TIMESTAMP} latest_deployment && echo '✅ Extracted and linked' && cd latest_deployment && if [ -f ~/deployment_package_20251016_074413/codebase/.env ]; then cp ~/deployment_package_20251016_074413/codebase/.env ./.env; echo '✅ Copied .env'; fi"

if [ $? -ne 0 ]; then
    echo "   ❌ Extraction failed!"
    rm -f "/tmp/${ARCHIVE}"
    exit 1
fi

# Clean up local archive
rm -f "/tmp/${ARCHIVE}"

echo ""
echo "========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================================="
echo ""
echo "📂 Location: ~/deployment_${TIMESTAMP}"
echo "🔗 Symlink: ~/latest_deployment"
echo ""
echo "🚀 Ready to test!"

