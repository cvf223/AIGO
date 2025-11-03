#!/bin/bash

# 🎯 FORCE HEAP ALLOCATION BEFORE NODE.JS STARTS
# ===============================================
# Uses ulimits and system-level memory control to force 400GB heap
# allocation before Node.js can apply its dynamic memory management

set -e

echo "🎯 FORCING 400GB HEAP ALLOCATION"
echo "================================="

# Check if running as root (required for memory limits)
if [ "$EUID" -ne 0 ]; then
    echo "⚠️ Warning: Not running as root. Memory limits may not work."
fi

# Check system memory
TOTAL_MEM_GB=$(free -g | awk '/^Mem:/{print $2}')
echo "📊 System RAM: ${TOTAL_MEM_GB}GB"

if [ "$TOTAL_MEM_GB" -lt 450 ]; then
    echo "❌ ERROR: Insufficient system memory!"
    echo "   Required: 450GB, Available: ${TOTAL_MEM_GB}GB"
    exit 1
fi

# Force memory limits BEFORE Node.js starts
echo "🔧 Setting memory limits..."

# Virtual memory: 400GB + 50GB buffer = 450GB
VIRTUAL_MEM_KB=$((450 * 1024 * 1024))
ulimit -v $VIRTUAL_MEM_KB
echo "   ✅ Virtual memory: ${VIRTUAL_MEM_KB}KB (~450GB)"

# Resident set size: 400GB
RESIDENT_MEM_KB=$((400 * 1024 * 1024))
ulimit -m $RESIDENT_MEM_KB 2>/dev/null || echo "   ⚠️ Could not set resident memory limit (may not be supported)"

# Stack size: 1GB (prevent stack overflow)
ulimit -s $((1024 * 1024))

# Show current limits
echo "📋 Memory limits set:"
ulimit -a | grep -E "virtual memory|max memory size|stack size"

# Set only SAFE NODE_OPTIONS (flags that are allowed)
export NODE_OPTIONS="--expose-gc --trace-gc"

# Environment variables for the script
export OBSERVATION_MODE_ENFORCED=true
export SKIP_ALL_SERVICES=true
export MINIMAL_MODE=true
export FORCE_HEAP_ALLOCATION=true

# Clear any conflicting environment
unset npm_config_node_options
unset NODEJS_OPTIONS

echo "🔧 NODE_OPTIONS: $NODE_OPTIONS"
echo "🚀 Starting Node.js with forced heap allocation..."
echo "=================================================="

# Start Node.js with memory flags passed DIRECTLY to node (not via NODE_OPTIONS)
exec node \
    --max-old-space-size=409600 \
    --max-semi-space-size=2048 \
    --initial-old-space-size=409600 \
    --disable-old-space-reduce \
    --trace-gc \
    --trace-gc-verbose \
    --trace-gc-nvp \
    start-observation-only.js

# If we reach here, something went wrong
echo "❌ Node.js process ended unexpectedly"
exit 1
