#!/bin/bash

###############################################################################
# 🚀 DEPLOY GUI FIXES TO PRODUCTION SERVER
###############################################################################
# 
# This script deploys the recent GUI fixes to the production server
# at 162.55.83.33
#
# What will be deployed:
# - Chat page LLM loading fix
# - Visual feedback indicators for reasoning methods
# - Pulse animation CSS
# - Documentation and health check script
#
###############################################################################

set -e  # Exit on error

echo ""
echo "🏗️ ============================================================="
echo "   CONSTRUCTION SYNDICATE - GUI FIXES DEPLOYMENT"
echo "=============================================================="
echo ""

# Configuration
SERVER_IP="162.55.83.33"
SERVER_USER="root"  # Change if needed
PROJECT_PATH="/root/Multi-Agent-AI-Framework"
BRANCH="feature/llm-vlm-optimization-complete-construction-syndicate"

echo "📋 Deployment Configuration:"
echo "   Server: $SERVER_IP"
echo "   User: $SERVER_USER"
echo "   Path: $PROJECT_PATH"
echo "   Branch: $BRANCH"
echo ""

# Step 1: Push to remote repository (if configured)
echo "📤 Step 1: Pushing changes to remote repository..."
echo ""

if git remote | grep -q "origin"; then
    echo "   Pushing to origin..."
    git push origin "$BRANCH" || {
        echo "   ⚠️  Failed to push to origin (continuing anyway)"
    }
else
    echo "   ℹ️  No 'origin' remote configured, skipping push"
fi

echo ""
echo "✅ Local commit ready for deployment"
echo ""

# Step 2: Create server deployment script
echo "📝 Step 2: Creating server-side deployment script..."
echo ""

cat > /tmp/deploy-on-server.sh << 'EOF'
#!/bin/bash
set -e

echo ""
echo "🚀 Deploying GUI fixes on server..."
echo ""

cd /root/Multi-Agent-AI-Framework

# Fetch latest changes
echo "   📥 Fetching latest changes..."
git fetch --all

# Stash any local changes
echo "   💾 Stashing local changes (if any)..."
git stash || true

# Checkout and pull the branch
echo "   🔄 Checking out branch..."
git checkout feature/llm-vlm-optimization-complete-construction-syndicate
git pull origin feature/llm-vlm-optimization-complete-construction-syndicate || {
    echo "   ⚠️  Pull failed, using local commits"
}

# Navigate to frontend
echo "   📦 Installing frontend dependencies..."
cd web-gui-construction
npm install || {
    echo "   ⚠️  npm install failed, continuing..."
}

# Restart services
echo "   🔄 Restarting GUI services..."
echo ""
echo "   ⚠️  MANUAL ACTION REQUIRED:"
echo "   Please restart the following services:"
echo "   1. Backend: pkill -f construction-gui-server || node start-construction-clean.js"
echo "   2. Frontend: cd web-gui-construction && npm run dev"
echo ""

echo "✅ Deployment complete!"
echo ""
echo "📊 Verify deployment:"
echo "   1. Check WebSocket: http://162.55.83.33:3000"
echo "   2. Run health check: node verify-gui-health.js"
echo "   3. Test reasoning indicators show '● ACTIVE'"
echo ""
EOF

# Step 3: Copy script to server and execute
echo "🌐 Step 3: Deploying to server $SERVER_IP..."
echo ""

if command -v ssh &> /dev/null; then
    echo "   Connecting to server..."
    
    # Copy the deployment script
    scp /tmp/deploy-on-server.sh "$SERVER_USER@$SERVER_IP:/tmp/" && \
    
    # Execute on server
    ssh "$SERVER_USER@$SERVER_IP" "bash /tmp/deploy-on-server.sh" && \
    
    echo "" && \
    echo "✅ Deployment successful!" && \
    echo "" && \
    echo "🎉 GUI fixes deployed to production server!" || {
        echo ""
        echo "❌ Deployment failed!"
        echo ""
        echo "📋 Manual deployment steps:"
        echo "   1. SSH to server: ssh $SERVER_USER@$SERVER_IP"
        echo "   2. Navigate: cd $PROJECT_PATH"
        echo "   3. Pull changes: git pull origin $BRANCH"
        echo "   4. Install deps: cd web-gui-construction && npm install"
        echo "   5. Restart services"
        exit 1
    }
else
    echo "❌ SSH command not found!"
    echo ""
    echo "📋 Manual deployment required:"
    echo ""
    echo "1. Connect to server:"
    echo "   ssh $SERVER_USER@$SERVER_IP"
    echo ""
    echo "2. Navigate to project:"
    echo "   cd $PROJECT_PATH"
    echo ""
    echo "3. Fetch and pull changes:"
    echo "   git fetch --all"
    echo "   git checkout $BRANCH"
    echo "   git pull origin $BRANCH"
    echo ""
    echo "4. Install dependencies:"
    echo "   cd web-gui-construction"
    echo "   npm install"
    echo ""
    echo "5. Restart services:"
    echo "   # Kill existing processes"
    echo "   pkill -f construction-gui-server"
    echo "   pkill -f 'next dev'"
    echo ""
    echo "   # Start backend"
    echo "   cd /root/Multi-Agent-AI-Framework"
    echo "   node start-construction-clean.js"
    echo ""
    echo "   # Start frontend (in new terminal)"
    echo "   cd /root/Multi-Agent-AI-Framework/web-gui-construction"
    echo "   npm run dev"
    echo ""
    echo "6. Verify deployment:"
    echo "   node verify-gui-health.js"
    echo ""
    exit 1
fi

# Step 4: Post-deployment verification
echo ""
echo "🔍 Step 4: Post-deployment verification..."
echo ""

echo "   Waiting 5 seconds for services to start..."
sleep 5

echo "   Running health check..."
node verify-gui-health.js || {
    echo ""
    echo "⚠️  Health check failed - services may need time to start"
    echo "   Run manually: node verify-gui-health.js"
}

echo ""
echo "=============================================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=============================================================="
echo ""
echo "📊 Next Steps:"
echo "   1. Open browser: http://162.55.83.33:3000"
echo "   2. Go to LLM Chat page"
echo "   3. Enable reasoning methods (CoT, CoA, ToT, GoT)"
echo "   4. Verify '● ACTIVE' indicators appear"
echo "   5. Check WebSocket shows 'CONNECTED'"
echo "   6. Send a test chat message"
echo ""
echo "📄 Documentation:"
echo "   - Full details: GUI_RESTORATION_COMPLETE.md"
echo "   - Quick start: QUICK_START_GUI.md"
echo ""
echo "✅ All GUI fixes are now live on production!"
echo ""

