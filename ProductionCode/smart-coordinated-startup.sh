#!/bin/bash

# 🚀 SMART COORDINATED STARTUP SYSTEM
# =====================================
# Intelligent port allocation and service coordination

echo "🚀 SMART COORDINATED STARTUP SYSTEM"
echo "===================================="
echo ""

# 📊 PORT ALLOCATION STRATEGY
echo "📊 PORT ALLOCATION:"
echo "   🌐 Backend Web GUI:     3001"
echo "   🖥️  Frontend Web GUI:    3002"  
echo "   🏗️  Construction System: 3003"
echo "   📋 HOAI System:         3004"
echo ""

# 🛑 STEP 1: Clean shutdown
echo "🛑 Step 1: Cleaning existing processes..."
pkill -f "streamlined-web-gui-server.js" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "start-construction-clean.js" 2>/dev/null || true
fuser -k 3001/tcp 2>/dev/null || true
fuser -k 3002/tcp 2>/dev/null || true
fuser -k 3003/tcp 2>/dev/null || true
sleep 3
echo "   ✅ Clean shutdown complete"

# 🌐 STEP 2: Start Backend (Port 3001)
echo "🌐 Step 2: Starting Backend (Port 3001)..."
cd /root/ProductionCode
export PORT=3001
nohup /usr/bin/node streamlined-web-gui-server.js > logs/backend.log 2>&1 &
sleep 5
echo "   ✅ Backend starting on port 3001"

# 🖥️ STEP 3: Start Frontend (Port 3002) 
echo "🖥️ Step 3: Starting Frontend (Port 3002)..."
cd /root/ProductionCode/web-gui-construction
export PORT=3002
nohup npm run start > ../logs/frontend.log 2>&1 &
sleep 8
echo "   ✅ Frontend starting on port 3002"

echo ""
echo "🎉 ALL SYSTEMS STARTED"
echo "🌐 Backend:  http://162.55.83.33:3001"
echo "🖥️ Frontend: http://162.55.83.33:3002"
