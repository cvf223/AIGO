#!/bin/bash
echo "🧪 Testing production system..."
echo ""

# Start the system in background
node --max-old-space-size=65536 startfullsyndicate.js > startup_test.log 2>&1 &
PID=$!

echo "⏳ Running system for 30 seconds..."
sleep 30

# Stop the system
kill $PID 2>/dev/null

echo ""
echo "📊 SYSTEM CHECK RESULTS:"
echo "========================"

# Check for critical patterns
echo -n "✅ Database connections: "
grep -c "Database.*success\|Database connected" startup_test.log 2>/dev/null || echo 0

echo -n "❌ Database errors: "
grep -c "DATABASE_CONNECTION_FAILED\|password authentication failed" startup_test.log 2>/dev/null || echo 0

echo -n "⚠️ Fallback warnings: "
grep -c "in-memory\|FALLBACK MODE\|Memory not found" startup_test.log 2>/dev/null || echo 0

echo -n "✅ Successful inits: "
grep -c "initialized successfully\|✅" startup_test.log 2>/dev/null || echo 0

echo -n "❌ Total errors: "
grep -c "Error\|ERROR\|❌" startup_test.log 2>/dev/null || echo 0

echo ""
echo "📋 Last 10 lines of log:"
echo "========================"
tail -10 startup_test.log

echo ""
echo "💡 Full log saved to: startup_test.log"
