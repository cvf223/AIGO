#!/bin/bash
# 🚀 CONSTRUCTION SYNDICATE LAUNCHER - 896GB OPTIMIZED
# ====================================================
# 
# Launches Construction Syndicate with proper Node.js configuration
# for 896GB RAM server

cd "$(dirname "$0")"

# Node.js Configuration for 896GB Server
NODE_OPTIONS="--max-old-space-size=65536"  # 64GB heap
NODE_OPTIONS="$NODE_OPTIONS --max-semi-space-size=128"  # 128MB semi-space
NODE_OPTIONS="$NODE_OPTIONS --trace-warnings"  # Show warning sources

echo "🚀 Launching Construction Syndicate..."
echo "💾 Node.js Heap: 64GB"
echo "🌍 Environment: ${NODE_ENV:-production}"
echo "============================================"

export NODE_OPTIONS

# Launch with full configuration
node startfullsyndicate.js

echo ""
echo "🛑 Construction Syndicate shutdown"

