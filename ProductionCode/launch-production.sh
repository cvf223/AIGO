#!/bin/bash

# 🚀 ELITE CONSTRUCTION AI SYNDICATE - PRODUCTION LAUNCHER
# =========================================================
#
# Optimized for 896GB RAM server with proper heap allocation
# and memory management for concurrent tender processing

echo "🚀 Launching Elite Construction AI Syndicate..."
echo "💾 System Memory: 896GB"
echo "🧠 Node.js Heap: 64GB"
echo "⚡ Max Semi-Space: 128MB"
echo "🌍 Environment: Production"
echo "============================================"

# Set production environment
export NODE_ENV=production

# Memory optimization for 896GB server
export NODE_OPTIONS="--max-old-space-size=65536 --max-semi-space-size=128"

# Enable memory profiling and GC tracking
export NODE_OPTIONS="$NODE_OPTIONS --expose-gc --trace-warnings"

# Linux memory optimizations
export MALLOC_ARENA_MAX=2

# Database connection optimization
export PGPOOL_SIZE=50
export PGPOOL_TIMEOUT=30000

# Launch the application
node \
    --max-old-space-size=65536 \
    --max-semi-space-size=128 \
    --expose-gc \
    --trace-warnings \
    --trace-deprecation \
    startfullsyndicate.js

echo "🛑 Construction Syndicate shutdown"
