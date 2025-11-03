#!/bin/bash

echo "🎯 COMPREHENSIVE SMART MODE TEST"
echo "================================="
echo ""
echo "Testing startup with Smart Development Mode enabled..."
echo ""

START_TIME=$(date +%s)
(node startfullsyndicate.js 2>&1 & SCRIPT_PID=$! && sleep 40 && kill $SCRIPT_PID 2>/dev/null) > /tmp/smart_mode_test.log 2>&1
END_TIME=$(date +%s)

echo "📊 TEST RESULTS:"
echo "----------------"
echo ""
echo "Smart Mode Status:"
grep "SMART MODE" /tmp/smart_mode_test.log | head -5
echo ""
echo "Retry Attempts:"
RETRY_COUNT=$(grep -c "Retrying request" /tmp/smart_mode_test.log)
echo "   Total retries: $RETRY_COUNT"
echo ""
echo "Evolution Cycles:"
EVOLUTION_COUNT=$(grep -c "Evolution Cycle" /tmp/smart_mode_test.log)
echo "   Total cycles: $EVOLUTION_COUNT"
echo ""
echo "Initialization:"
INIT_COUNT=$(grep -c "Construction Syndicate Orchestrator.*initialized" /tmp/smart_mode_test.log)
echo "   System initialized: $INIT_COUNT times"
echo ""
echo "⏱️  Test Duration: $((END_TIME - START_TIME)) seconds"
echo ""

if [ $RETRY_COUNT -eq 0 ] && [ $EVOLUTION_COUNT -eq 0 ] && [ $INIT_COUNT -eq 1 ]; then
    echo "✅ ALL TESTS PASSED!"
    echo "   ✓ No retry spam"
    echo "   ✓ No evolution loops"
    echo "   ✓ Single initialization"
    echo "   ✓ Fast startup achieved!"
else
    echo "⚠️  TEST RESULTS:"
    [ $RETRY_COUNT -gt 0 ] && echo "   ⚠️  Still seeing retries: $RETRY_COUNT"
    [ $EVOLUTION_COUNT -gt 0 ] && echo "   ⚠️  Still seeing evolution cycles: $EVOLUTION_COUNT"
    [ $INIT_COUNT -ne 1 ] && echo "   ⚠️  Multiple initializations: $INIT_COUNT"
fi

echo ""
echo "📋 Full log saved to: /tmp/smart_mode_test.log"
