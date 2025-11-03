#!/bin/bash

##
# 🏗️ START CONSTRUCTION SYNDICATE GUI
# ===================================
# 
# Convenience script to start both backend and frontend
##

echo "🏗️ Starting Construction Syndicate GUI..."
echo ""

# Check if backend is running
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "⚠️  Backend not detected on port 3001"
    echo "📋 Please start the backend first:"
    echo "    node startfullsyndicate.js"
    echo ""
    echo "Or continue anyway to start frontend only? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Backend detected on port 3001"
fi

echo ""
echo "🚀 Starting Frontend (Next.js)..."
echo "   URL: http://localhost:3002"
echo ""

# Start Next.js development server
pnpm dev

echo ""
echo "✅ Construction Syndicate GUI running!"
echo ""
echo "📊 Frontend: http://localhost:3002"
echo "🔌 Backend API: http://localhost:3001"
echo "📡 WebSocket: ws://localhost:3001"
echo ""

