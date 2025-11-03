#!/bin/bash

echo "========================================="
echo "🚀 ROBUST SERVER DEPLOYMENT"
echo "========================================="
echo ""

SERVER="root@162.55.83.33"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_NAME="deployment_package_${TIMESTAMP}"

echo "📊 Testing SSH connection first..."
if ! ssh -o ConnectTimeout=10 $SERVER 'echo "✅ SSH connection OK"' 2>/dev/null; then
    echo "❌ SSH connection failed!"
    echo ""
    echo "Please verify:"
    echo "  1. Server is reachable: ping 162.55.83.33"
    echo "  2. SSH works: ssh root@162.55.83.33"
    echo "  3. SSH key is configured"
    exit 1
fi

echo ""
echo "🎯 Deployment strategy: RSYNC (more reliable than scp)"
echo ""

# Create temporary directory for clean deployment
TEMP_DEPLOY="/tmp/deploy_${TIMESTAMP}"
mkdir -p "$TEMP_DEPLOY"

echo "📦 Copying files to deployment directory..."

# Copy essential files
rsync -av --progress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.bak' \
    --exclude='*.backup' \
    --exclude='.cursor' \
    --exclude='test_*.js' \
    --exclude='*.md' \
    --exclude='.env' \
    --exclude='__pycache__' \
    --exclude='*.sh' \
    ./ "$TEMP_DEPLOY/" 2>&1 | grep -v "building file list"

echo ""
echo "📤 Syncing to server with rsync..."

rsync -avz --progress \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='*.bak' \
    --exclude='*.backup' \
    --exclude='.cursor' \
    --exclude='test_*.js' \
    --exclude='*.md' \
    --exclude='.env.local' \
    --exclude='__pycache__' \
    --exclude='*.sh' \
    "$TEMP_DEPLOY/" "${SERVER}:~/${DEPLOY_NAME}/"

RSYNC_EXIT=$?

# Clean up local temp
rm -rf "$TEMP_DEPLOY"

if [ $RSYNC_EXIT -ne 0 ]; then
    echo ""
    echo "❌ Rsync failed with exit code: $RSYNC_EXIT"
    echo ""
    echo "Trying alternative method: tar + ssh pipe..."
    echo ""
    
    # Alternative: pipe tar through SSH
    tar czf - \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='*.bak' \
        --exclude='*.backup' \
        --exclude='.cursor' \
        --exclude='test_*.js' \
        --exclude='*.md' \
        --exclude='.env' \
        --exclude='__pycache__' \
        . | ssh $SERVER "mkdir -p ~/${DEPLOY_NAME} && cd ~/${DEPLOY_NAME} && tar xzf -"
    
    if [ $? -ne 0 ]; then
        echo "❌ Alternative method also failed"
        exit 1
    fi
    
    echo "✅ Upload complete via tar+ssh"
fi

echo ""
echo "🔧 Configuring deployment on server..."

ssh $SERVER << ENDSSH
    set -e
    
    cd ~/${DEPLOY_NAME}
    
    # Copy .env from old deployment if exists
    if [ -f ~/deployment_package_20251016_074413/codebase/.env ]; then
        echo "   📋 Copying .env..."
        cp ~/deployment_package_20251016_074413/codebase/.env ./.env
    fi
    
    # Install dependencies
    echo "   📦 Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        echo "   Using pnpm..."
        pnpm install --prod 2>&1 | tail -10
    else
        echo "   Using npm..."
        npm install --production 2>&1 | tail -10
    fi
    
    # Make scripts executable
    chmod +x *.sh 2>/dev/null || true
    
    # Create symlink
    cd ~
    rm -f latest_deployment
    ln -sf ${DEPLOY_NAME} latest_deployment
    
    echo ""
    echo "✅ Deployment configured"
    echo "📂 Location: ~/${DEPLOY_NAME}"
    echo "🔗 Symlink: ~/latest_deployment"
    
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "========================================="
    echo ""
    echo "🎯 Latest fixes deployed:"
    echo "  • All database connection fixes ✓"
    echo "  • All blockchain removal fixes ✓"
    echo "  • SFT Flywheel integration ✓"
    echo "  • Annotation system integration ✓"
    echo "  • All import path fixes ✓"
    echo "  • Memory persistence fixes ✓"
    echo ""
    echo "🧪 Ready to test!"
    echo ""
    echo "Test command:"
    echo "  ssh $SERVER 'cd ~/latest_deployment && ./launch-production.sh'"
    echo ""
else
    echo ""
    echo "❌ Deployment configuration failed!"
    exit 1
fi

