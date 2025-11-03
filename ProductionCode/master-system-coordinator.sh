#!/bin/bash

# 🚀 MASTER SYSTEM COORDINATOR
# ============================
# Coordinates all systems with smart port allocation

echo "🚀 MASTER SYSTEM COORDINATOR"
echo "============================"
echo ""

# 📊 MASTER PORT MAP
echo "📊 MASTER PORT ALLOCATION:"
echo "   🌐 Backend Web GUI:     3001"
echo "   🖥️  Frontend Web GUI:    3002"  
echo "   🏗️  Construction System: 3003"
echo "   📋 HOAI LP6/LP7 System: 3004"
echo "   📊 Monitoring Hub:      3005"
echo ""

# 🛑 Clean start
echo "🛑 Performing clean system start..."
pkill -f "streamlined-web-gui-server.js" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "start-construction-clean.js" 2>/dev/null || true
pkill -f "complete-hoai-lp6-lp7-execution.js" 2>/dev/null || true
for port in 3001 3002 3003 3004 3005; do
    fuser -k ${port}/tcp 2>/dev/null || true
done
sleep 3
echo "   ✅ Clean start complete"
echo ""

# Create logs directory
mkdir -p /root/ProductionCode/logs

# 🌐 START BACKEND (3001)
echo "🌐 Starting Backend Web GUI on port 3001..."
cd /root/ProductionCode
export PORT=3001
export FRONTEND_PORT=3002
nohup /usr/bin/node streamlined-web-gui-server.js > logs/backend-3001.log 2>&1 &
echo "   PID: $!"
sleep 5

# 🖥️ START FRONTEND (3002)  
echo "🖥️ Starting Frontend Web GUI on port 3002..."
cd /root/ProductionCode/web-gui-construction
export PORT=3002
export NEXT_PUBLIC_API_URL=http://162.55.83.33:3001
export NEXT_PUBLIC_WS_URL=ws://162.55.83.33:3001
nohup npm run start > ../logs/frontend-3002.log 2>&1 &
echo "   PID: $!"
sleep 8

# 🏗️ START CONSTRUCTION SYNDICATE (3003)
echo "🏗️ Starting Construction Syndicate on port 3003..."
cd /root/ProductionCode  
export PORT=3003
export WEB_GUI_PORT=3001
nohup /usr/bin/node start-construction-clean.js > logs/construction-3003.log 2>&1 &
echo "   PID: $!"
sleep 5

echo ""
echo "🎉 MASTER COORDINATION COMPLETE"
echo "==============================="
echo "🌐 Web Backend:      http://162.55.83.33:3001"
echo "🖥️ Web Frontend:     http://162.55.83.33:3002" 
echo "🏗️ Construction:     Running on port 3003"
echo "📋 HOAI Available:   Use PORT=3004 when needed"
echo "==============================="
echo ""

# Health verification
echo "🔍 System Health Verification:"
sleep 3
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend healthy"
else
    echo "   ⚠️ Backend check failed" 
fi

if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "   ✅ Frontend healthy"
else
    echo "   ⚠️ Frontend check failed"
fi

echo ""
echo "📊 Active processes:"
ps aux | grep -E "(streamlined-web-gui-server|next-server|start-construction-clean)" | grep -v grep

