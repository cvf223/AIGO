#!/bin/bash

echo "📊 SYSTEM STATUS CHECK"
echo "====================="
echo ""

echo "🔍 Daemon processes:"
ps aux | grep -E "(streamlined-web-gui-server|next-server|start-construction-clean)" | grep -v grep || echo "❌ No processes found"

echo ""
echo "🌐 Service health checks:"

# Backend check
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend (3001): HEALTHY"
else
    echo "   ❌ Backend (3001): DOWN"
fi

# Frontend check  
if curl -s -I http://localhost:3002 > /dev/null 2>&1; then
    echo "   ✅ Frontend (3002): HEALTHY"
else
    echo "   ❌ Frontend (3002): DOWN"
fi

echo ""
echo "📊 Port status:"
netstat -tulpn | grep -E ":300[1-3]" | sort

echo ""
echo "🔗 Access URLs:"
echo "   🖥️ Main Interface: http://162.55.83.33:3002"
echo "   🌐 Backend API:    http://162.55.83.33:3001" 
echo "   🔌 WebSocket:      ws://162.55.83.33:3001"

