#!/bin/bash

# 🚀 DAEMON STARTUP - Survives SSH disconnection
# ==============================================

echo "🚀 DAEMON STARTUP SYSTEM"
echo "======================="
echo ""

# Create logs directory
mkdir -p logs

# Function to start daemon process
start_daemon() {
    local name=$1
    local command=$2
    local logfile=$3
    
    echo "🔄 Starting $name daemon..."
    
    # Use setsid to create new session, nohup to ignore HUP signal
    setsid nohup $command > $logfile 2>&1 < /dev/null &
    local pid=$!
    
    # Disown the process to completely detach it
    disown
    
    echo "   ✅ $name daemon started (PID: $pid)"
    sleep 2
}

# Kill existing processes first
echo "🧹 Cleaning existing processes..."
pkill -f "streamlined-web-gui-server.js" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true  
pkill -f "start-construction-clean.js" 2>/dev/null || true
sleep 3

# Start all daemons
cd /root/ProductionCode

# Backend daemon
start_daemon "Backend" "/usr/bin/node streamlined-web-gui-server.js" "logs/backend-daemon.log"

# Frontend daemon  
cd web-gui-construction
start_daemon "Frontend" "npm run start" "../logs/frontend-daemon.log"
cd ..

# Construction syndicate daemon
start_daemon "Construction" "/usr/bin/node start-construction-clean.js" "logs/construction-daemon.log"

echo ""
echo "🎉 ALL DAEMONS STARTED"
echo "====================="
echo "🌐 Backend:  http://162.55.83.33:3001"
echo "🖥️ Frontend: http://162.55.83.33:3002" 
echo "🏗️ Construction: Running on smart ports"
echo ""
echo "📊 Daemon processes (fully detached):"
sleep 5
ps aux | grep -E "(streamlined-web-gui-server|next-server|start-construction-clean)" | grep -v grep

echo ""
echo "✅ Systems will survive SSH disconnection!"
echo "📋 Check status: ps aux | grep node"
