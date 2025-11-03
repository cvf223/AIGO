#!/bin/bash

echo "========================================="
echo "🚀 DEPLOYING LATEST CODEBASE TO SERVER"
echo "========================================="
echo ""

SERVER="root@162.55.83.33"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_NAME="deployment_package_${TIMESTAMP}"
LOCAL_PACKAGE="/tmp/${DEPLOY_NAME}.tar.gz"

echo "📦 Creating deployment package..."
echo "   Timestamp: $TIMESTAMP"
echo ""

# Create deployment package (exclude node_modules, .git, temp files)
echo "📦 Packaging codebase..."
tar -czf "$LOCAL_PACKAGE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.bak' \
    --exclude='*.backup' \
    --exclude='.cursor' \
    --exclude='test_*.js' \
    --exclude='*.sh' \
    --exclude='*.md' \
    --exclude='.env' \
    --exclude='__pycache__' \
    .

PACKAGE_SIZE=$(du -h "$LOCAL_PACKAGE" | cut -f1)
echo "   ✅ Package created: $PACKAGE_SIZE"
echo ""

echo "📤 Uploading to server..."
scp "$LOCAL_PACKAGE" "${SERVER}:/tmp/" 2>&1 | grep -v "Warning: Permanently added"

if [ $? -eq 0 ]; then
    echo "   ✅ Upload complete"
else
    echo "   ❌ Upload failed"
    exit 1
fi

echo ""
echo "📂 Deploying on server..."

ssh $SERVER << ENDSSH
    set -e
    
    echo "📂 Setting up new deployment..."
    
    # Create deployment directory
    cd ~
    mkdir -p ${DEPLOY_NAME}
    
    # Extract package
    echo "   📦 Extracting package..."
    tar -xzf /tmp/${DEPLOY_NAME}.tar.gz -C ${DEPLOY_NAME}/
    
    # Clean up package
    rm -f /tmp/${DEPLOY_NAME}.tar.gz
    
    # Copy .env from old deployment if exists
    if [ -f ~/deployment_package_20251016_074413/codebase/.env ]; then
        echo "   📋 Copying .env from previous deployment..."
        cp ~/deployment_package_20251016_074413/codebase/.env ${DEPLOY_NAME}/.env
    fi
    
    # Install dependencies
    echo "   📦 Installing dependencies..."
    cd ${DEPLOY_NAME}
    
    # Check if pnpm is available, otherwise use npm
    if command -v pnpm &> /dev/null; then
        pnpm install --prod 2>&1 | tail -5
    else
        npm install --production 2>&1 | tail -5
    fi
    
    # Make scripts executable
    chmod +x *.sh 2>/dev/null || true
    
    # Create symlink to latest
    cd ~
    rm -f latest_deployment
    ln -sf ${DEPLOY_NAME} latest_deployment
    
    echo ""
    echo "✅ Deployment complete: ~/${DEPLOY_NAME}"
    echo "📂 Symlink created: ~/latest_deployment"
    
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "========================================="
    echo ""
    echo "🎯 Deployed to: ~/${DEPLOY_NAME}"
    echo "🔗 Latest link: ~/latest_deployment"
    echo ""
    echo "🧪 Ready to test!"
    echo ""
    echo "Test commands:"
    echo "  ssh $SERVER 'cd ~/latest_deployment && ./launch-production.sh'"
    echo ""
    
    # Clean up local package
    rm -f "$LOCAL_PACKAGE"
    
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi

