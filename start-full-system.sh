#!/bin/bash

# 🏗️ FULL CONSTRUCTION SYSTEM STARTUP WITH HEAP ENFORCEMENT
# ==========================================================
# Complete system startup with proper 400GB heap allocation

set -e

echo "🏗️ FULL CONSTRUCTION SYSTEM STARTUP"
echo "===================================="

# Check system memory
TOTAL_MEM_GB=$(free -g | awk '/^Mem:/{print $2}')
echo "📊 System RAM: ${TOTAL_MEM_GB}GB"

if [ "$TOTAL_MEM_GB" -lt 400 ]; then
    echo "⚠️ WARNING: System has less than 400GB RAM"
    echo "   This may affect performance with full system load"
fi

# Clear all Node.js environment variables to prevent conflicts
unset NODE_OPTIONS
unset npm_config_node_options
unset NODEJS_OPTIONS

# Set FULL SYSTEM MODE environment variables
export OBSERVATION_MODE_ENFORCED=false
export SKIP_ALL_SERVICES=false
export MINIMAL_MODE=false
export FULL_SYSTEM_MODE=true
export SYNDICATE_MODE=FULL

echo "🔧 Environment configured for full system mode"
echo "🚀 Starting with 400GB heap allocation..."
echo "=============================================="

# Start Node.js with full heap allocation and full system
exec node \
    --max-old-space-size=409600 \
    --max-semi-space-size=2048 \
    --expose-gc \
    --trace-gc \
    start-full-system.js

# If we reach here, something went wrong
echo "❌ Full system startup failed"
exit 1
