#!/bin/bash

###############################################################################
# 🚀 CONSTRUCTION SYNDICATE - PRODUCTION STARTUP
###############################################################################
#
# Elite startup script with health checks and proper sequencing
#
###############################################################################

set -e

echo ""
echo "🏗️ ============================================================="
echo "   CONSTRUCTION SYNDICATE - PRODUCTION STARTUP"
echo "=============================================================="
echo ""

# Configuration
DEPLOYMENT_PATH="${1:-~/latest_deployment}"
BACKEND_WAIT=45
FRONTEND_WAIT=15

cd "$DEPLOYMENT_PATH" || {
    echo "❌ Deployment path not found: $DEPLOYMENT_PATH"
    exit 1
}

echo "📍 Deployment Path: $DEPLOYMENT_PATH"
echo ""

# Step 1: Clean slate
echo "🧹 Step 1: Cleaning up existing processes..."
PM2_HOME=~/.pm2 pm2 kill 2>/dev/null || true
killall -9 node 2>/dev/null || true
sleep 3
echo "   ✅ All processes stopped"
echo ""

# Step 2: Set environment
echo "🔧 Step 2: Setting environment variables..."
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=16384"
echo "   ✅ Environment configured"
echo ""

# Step 3: Start backend
echo "📡 Step 3: Starting backend..."
PM2_HOME=~/.pm2 pm2 start start-construction-clean.js \
    --name construction-backend \
    --node-args="--max-old-space-size=16384" \
    --max-memory-restart 8000M \
    --time \
    --no-autorestart

echo "   ⏳ Waiting ${BACKEND_WAIT} seconds for backend initialization..."
sleep $BACKEND_WAIT
echo ""

# Step 4: Verify backend
echo "🔍 Step 4: Verifying backend..."
if lsof -i:3001 | grep LISTEN > /dev/null; then
    echo "   ✅ Backend listening on port 3001"
else
    echo "   ❌ Backend NOT listening on port 3001!"
    echo ""
    echo "📋 Backend logs (last 50 lines):"
    echo "-------------------------------------------------------------------"
    PM2_HOME=~/.pm2 pm2 logs construction-backend --lines 50 --nostream
    echo "-------------------------------------------------------------------"
    echo ""
    echo "❌ STARTUP FAILED - Backend not ready"
    exit 1
fi
echo ""

# Step 5: Test backend health
echo "🏥 Step 5: Testing backend health..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "   ✅ Health endpoint responding"
    curl -s http://localhost:3001/health | head -5
else
    echo "   ⚠️  Health endpoint not responding (may still be initializing)"
fi
echo ""

# Step 6: Test WebSocket
echo "🔌 Step 6: Testing WebSocket endpoint..."
if curl -s "http://localhost:3001/socket.io/?EIO=4&transport=polling" | grep -q "0{"; then
    echo "   ✅ WebSocket endpoint responding"
else
    echo "   ⚠️  WebSocket endpoint not responding (may not be critical)"
fi
echo ""

# Step 7: Start frontend
echo "🎨 Step 7: Starting frontend..."
cd web-gui-construction || {
    echo "   ❌ web-gui-construction folder not found!"
    exit 1
}

PM2_HOME=~/.pm2 pm2 start npm \
    --name construction-frontend \
    -- run start

echo "   ⏳ Waiting ${FRONTEND_WAIT} seconds for frontend initialization..."
sleep $FRONTEND_WAIT
echo ""

# Step 8: Verify frontend
echo "🔍 Step 8: Verifying frontend..."
if lsof -i:3002 | grep LISTEN > /dev/null; then
    echo "   ✅ Frontend listening on port 3002"
else
    echo "   ❌ Frontend NOT listening on port 3002!"
    echo ""
    echo "📋 Frontend logs (last 50 lines):"
    echo "-------------------------------------------------------------------"
    PM2_HOME=~/.pm2 pm2 logs construction-frontend --lines 50 --nostream
    echo "-------------------------------------------------------------------"
    echo ""
    echo "❌ STARTUP FAILED - Frontend not ready"
    exit 1
fi
echo ""

# Step 9: Test frontend
echo "🌐 Step 9: Testing frontend..."
if curl -s http://localhost:3002 | grep -q "CONSTRUCTION SYNDICATE"; then
    echo "   ✅ Frontend serving pages"
else
    echo "   ⚠️  Frontend not responding properly"
fi
echo ""

# Step 10: Save PM2 configuration
echo "💾 Step 10: Saving PM2 configuration..."
PM2_HOME=~/.pm2 pm2 save
echo "   ✅ PM2 configuration saved"
echo ""

# Final status
echo "=============================================================="
echo "✅ CONSTRUCTION SYNDICATE STARTED SUCCESSFULLY"
echo "=============================================================="
echo ""
echo "📊 Process Status:"
PM2_HOME=~/.pm2 pm2 list
echo ""
echo "📡 Access Points:"
echo "   Backend:  http://162.55.83.33:3001"
echo "   Frontend: http://162.55.83.33:3002"
echo ""
echo "📋 Management Commands:"
echo "   PM2_HOME=~/.pm2 pm2 list             - View processes"
echo "   PM2_HOME=~/.pm2 pm2 logs             - View all logs"
echo "   PM2_HOME=~/.pm2 pm2 restart all      - Restart everything"
echo "   PM2_HOME=~/.pm2 pm2 stop all         - Stop everything"
echo ""
echo "🧪 Test WebSocket:"
echo "   node test-websocket-connection.js"
echo ""
echo "🎉 SYSTEM READY FOR PRODUCTION!"
echo ""

