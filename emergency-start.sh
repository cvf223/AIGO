#!/bin/bash

# 🚨 EMERGENCY 896GB MEMORY ALLOCATION
# ====================================

export NODE_OPTIONS="--max-old-space-size=409600 --max-semi-space-size=8192 --expose-gc --huge-max-old-generation-size"
export UV_THREADPOOL_SIZE=128
export MEMORY_OPTIMIZED=true
export ENABLE_PERFORMANCE_MONITORING=false

echo "🚀 EMERGENCY STARTUP: 400GB Memory Allocation Active"
echo "📊 Thread Pool: 128 threads"
echo "⚡ Performance Monitoring: DISABLED"

node startfullsyndicate.js
