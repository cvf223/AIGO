#!/bin/bash

# CRITICAL: Set memory allocation DIRECTLY
echo "🚀 DIRECT HEAP STARTUP"
echo "====================="
echo ""

# Get system memory
TOTAL_MEM=$(free -g | grep Mem | awk '{print $2}')
echo "System Memory: ${TOTAL_MEM}GB"

# Set heap based on available memory
if [ $TOTAL_MEM -ge 800 ]; then
    HEAP_MB=204800  # 200GB
    echo "Using 200GB heap allocation"
elif [ $TOTAL_MEM -ge 400 ]; then
    HEAP_MB=102400  # 100GB
    echo "Using 100GB heap allocation"
elif [ $TOTAL_MEM -ge 200 ]; then
    HEAP_MB=51200   # 50GB
    echo "Using 50GB heap allocation"
else
    HEAP_MB=16384   # 16GB
    echo "Using 16GB heap allocation"
fi

echo ""
echo "Starting with EXPLICIT flags..."
echo "Command: node --max-old-space-size=${HEAP_MB} --expose-gc startfullsyndicate.js"
echo ""

# CRITICAL: Start with flags DIRECTLY on command line
cd ~/LocalBackup

# Export environment (but don't rely on it)
export OBSERVATION_MODE_ENFORCED=true
export SKIP_AUTONOMOUS_SYSTEMS=true
export HEAP_SIZE_GB=$((HEAP_MB / 1024))

# Start with explicit command line flags
exec node \
    --max-old-space-size=${HEAP_MB} \
    --expose-gc \
    startfullsyndicate.js
