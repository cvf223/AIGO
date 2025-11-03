#!/bin/bash
echo "🧪 Testing fixed system..."
echo ""

# Start the system
timeout 30 node --max-old-space-size=65536 startfullsyndicate.js 2>&1 | tee startup_test.log &
PID=$!

echo "⏳ Running for 30 seconds..."
sleep 30

# Check for critical patterns
echo ""
echo "📊 CHECKING FOR ISSUES:"
echo "======================"

# Check for fallback messages (should be 0)
FALLBACKS=$(grep -c "in-memory\|FALLBACK MODE\|Memory not found" startup_test.log 2>/dev/null || echo 0)
echo "Fallback messages: $FALLBACKS (should be 0)"

# Check for database success
DB_SUCCESS=$(grep -c "Database initialized successfully\|Database connected successfully" startup_test.log 2>/dev/null || echo 0)
echo "Database connections: $DB_SUCCESS (should be > 0)"

# Check for proper initialization
INIT_SUCCESS=$(grep -c "initialized successfully\|✅" startup_test.log 2>/dev/null || echo 0)
echo "Successful initializations: $INIT_SUCCESS"

# Check for errors
ERRORS=$(grep -c "Error\|ERROR\|❌" startup_test.log 2>/dev/null || echo 0)
echo "Total errors: $ERRORS"

# Kill the test process
kill $PID 2>/dev/null

echo ""
if [ "$FALLBACKS" -eq 0 ] && [ "$DB_SUCCESS" -gt 0 ]; then
    echo "✅ SYSTEM FIXED: No fallbacks, database working!"
else
    echo "⚠️ System still has issues, review startup_test.log"
fi
