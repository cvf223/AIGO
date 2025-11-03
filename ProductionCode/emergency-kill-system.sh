#!/bin/bash

# EMERGENCY SYSTEM KILL SCRIPT
# Stops all runaway AI arbitrage processes and frees resources

echo "🚨 EMERGENCY SYSTEM KILL INITIATED..."

# Kill all node processes containing our keywords
echo "🔪 Killing arbitrage processes..."
pkill -f "legendary-price-sync-engine"
pkill -f "start-alphago"
pkill -f "arbitrage"
pkill -f "eliza"
pkill -f "tsx.*agent"

# Kill all node processes with high memory usage
echo "🔪 Killing high memory node processes..."
ps aux | grep node | awk '$6 > 500000 { print $2 }' | xargs -r kill -9

# Kill all node processes with high CPU usage
echo "🔪 Killing high CPU node processes..."
ps aux | grep node | awk '$3 > 80.0 { print $2 }' | xargs -r kill -9

# Force kill all node processes if needed
echo "🔪 Force killing remaining node processes..."
pkill -9 -f node

# Kill any remaining tsx processes
echo "🔪 Killing tsx processes..."
pkill -9 -f tsx

# Kill any remaining pnpm processes
echo "🔪 Killing pnpm processes..."
pkill -9 -f pnpm

# Clean up any zombie processes
echo "🧹 Cleaning up zombie processes..."
ps aux | awk '$8 ~ /^Z/ { print $2 }' | xargs -r kill -9

# Show memory usage after cleanup
echo "📊 System status after cleanup:"
free -h
echo "🔍 Remaining node processes:"
ps aux | grep node | grep -v grep || echo "✅ No node processes running"

# Clear any stuck shared memory
echo "🧹 Clearing shared memory..."
ipcs -m | awk 'NR>3 {print $2}' | xargs -r ipcrm -m

echo "✅ EMERGENCY KILL COMPLETED"
echo "💡 If system is still slow, reboot with: sudo reboot" 