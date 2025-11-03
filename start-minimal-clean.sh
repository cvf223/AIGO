#!/bin/bash

# 🎯 CLEAN MINIMAL STARTUP (NO NODE_OPTIONS)
# ==========================================
# Completely clean approach to avoid NODE_OPTIONS conflicts

set -e

echo "🎯 CLEAN MINIMAL STARTUP - 400GB HEAP"
echo "======================================"

# Check system memory
TOTAL_MEM_GB=$(free -g | awk '/^Mem:/{print $2}')
echo "📊 System RAM: ${TOTAL_MEM_GB}GB"

if [ "$TOTAL_MEM_GB" -lt 400 ]; then
    echo "❌ WARNING: System has less than 400GB RAM"
fi

# COMPLETELY clear all Node.js environment variables
unset NODE_OPTIONS
unset npm_config_node_options
unset NODEJS_OPTIONS

# Set ONLY our environment variables
export OBSERVATION_MODE_ENFORCED=true
export SKIP_ALL_SERVICES=true
export MINIMAL_MODE=true

echo "🔧 Environment variables set for minimal mode"
echo "🚀 Starting Node.js with DIRECT memory flags..."
echo "=============================================="

# Start Node.js with ALL flags passed directly (NO NODE_OPTIONS)
exec node \
    --max-old-space-size=409600 \
    --max-semi-space-size=2048 \
    --expose-gc \
    --trace-gc \
    start-observation-only.js

# If we reach here, something went wrong
echo "❌ Node.js process ended unexpectedly"
exit 1
