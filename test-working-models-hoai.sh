#!/bin/bash

# 🎯 TEST WORKING MODELS WITH GERMAN HOAI PROMPT
# ==============================================
# Focus on models that actually work on CPU

echo "🎯 TESTING WORKING MODELS - German HOAI Architecture"
echo "====================================================="
echo ""

PROMPT="was ist besonders an deutscher architektur nach der HOAI ??!"

# Models that work on CPU (fast, proven)
MODELS=(
    "phi3:14b"
    "mistral:7b-instruct-fp16"
    "llama3.3:70b"
)

echo "📋 Prompt: $PROMPT"
echo "🎯 Testing 3 fast CPU-compatible models"
echo ""

# Test each model
for MODEL in "${MODELS[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧠 TESTING: $MODEL"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    START_TIME=$(date +%s)
    
    # Run test with 60-second timeout
    timeout 60 ollama run $MODEL "$PROMPT" > /tmp/${MODEL//:/

}_hoai.txt 2>&1
    
    EXIT_CODE=$?
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ SUCCESS in ${DURATION} seconds!"
        
        # Analyze response
        RESPONSE_LENGTH=$(wc -c < /tmp/${MODEL//:/}_hoai.txt)
        HOAI_COUNT=$(grep -oi "hoai" /tmp/${MODEL//:/}_hoai.txt | wc -l)
        ARCH_COUNT=$(grep -oi "architektur\|architecture" /tmp/${MODEL//:/}_hoai.txt | wc -l)
        
        echo "   📊 Response: $RESPONSE_LENGTH chars"
        echo "   🇩🇪 HOAI mentions: $HOAI_COUNT"
        echo "   🏗️ Architecture: $ARCH_COUNT"
        echo ""
        echo "📋 Response preview:"
        echo "─────────────────────────────"
        head -c 400 /tmp/${MODEL//:/}_hoai.txt
        echo ""
        echo "..."
        echo "─────────────────────────────"
        
    elif [ $EXIT_CODE -eq 124 ]; then
        echo "⏱️ TIMEOUT after 60 seconds"
    else
        echo "❌ FAILED with code $EXIT_CODE"
    fi
    
    echo ""
    sleep 2
done

echo ""
echo "=================================================="
echo "📊 SUMMARY: German HOAI Architecture Test"
echo "=================================================="
echo ""

# Count successes
SUCCESS_COUNT=0
for MODEL in "${MODELS[@]}"; do
    if [ -f /tmp/${MODEL//:/}_hoai.txt ] && [ -s /tmp/${MODEL//:/}_hoai.txt ]; then
        ((SUCCESS_COUNT++))
        echo "✅ $MODEL: WORKING"
    else
        echo "❌ $MODEL: FAILED"
    fi
done

echo ""
echo "🎯 VERDICT: $SUCCESS_COUNT/${#MODELS[@]} models working"
echo ""

if [ $SUCCESS_COUNT -ge 2 ]; then
    echo "🎉 SUCCESS: Multiple models responding to German HOAI prompts!"
    echo ""
    echo "💡 RECOMMENDATION:"
    echo "   • Use phi3:14b for fast responses (if it worked)"
    echo "   • Use llama3.3:70b for best quality (if it worked)"
    echo "   • Avoid qwen2.5 (too slow on CPU-only system)"
    echo ""
    echo "🧠 Next: Test with GOT reasoning using working models"
else
    echo "⚠️ Most models failed - may be system-wide issue"
fi
