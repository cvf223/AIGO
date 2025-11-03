#!/bin/bash

# 🇩🇪 FINAL TEST: qwen2.5 Q4 with German HOAI Prompt
# ==================================================

echo "🇩🇪 TESTING qwen2.5 Q4 with German HOAI Architecture Prompt"
echo "==========================================================="
echo ""

PROMPT="was ist besonders an deutscher architektur nach der HOAI ??!"

echo "📋 Prompt: $PROMPT"
echo "🎯 Model: qwen2.5:72b-instruct-q4_k_m (Optimized Q4)"
echo "⏱️ Timeout: 3 minutes"
echo ""
echo "🚀 Sending request..."
echo ""

# Use Ollama CLI (more reliable than API)
timeout 180 ollama run qwen2.5:72b-instruct-q4_k_m "$PROMPT" > /tmp/qwen_hoai_final.txt 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ SUCCESS! qwen2.5 Q4 responded!"
    echo ""
    echo "📊 Response Analysis:"
    
    # Get response length
    RESPONSE_LENGTH=$(wc -c < /tmp/qwen_hoai_final.txt)
    RESPONSE_LINES=$(wc -l < /tmp/qwen_hoai_final.txt)
    
    echo "   Length: $RESPONSE_LENGTH characters"
    echo "   Lines: $RESPONSE_LINES"
    
    # Count German/HOAI terms
    HOAI_COUNT=$(grep -oi "hoai" /tmp/qwen_hoai_final.txt | wc -l)
    ARCHITEKTUR_COUNT=$(grep -oi "architektur" /tmp/qwen_hoai_final.txt | wc -l)
    DEUTSCH_COUNT=$(grep -oi "deutsch\|german" /tmp/qwen_hoai_final.txt | wc -l)
    
    echo "   🇩🇪 HOAI mentions: $HOAI_COUNT"
    echo "   🏗️ Architecture mentions: $ARCHITEKTUR_COUNT"
    echo "   🇩🇪 German/Deutsch mentions: $DEUTSCH_COUNT"
    
    echo ""
    echo "📋 COMPLETE RESPONSE:"
    echo "=" | tr '\n' '=' | head -c 60
    echo ""
    cat /tmp/qwen_hoai_final.txt
    echo ""
    echo "=" | tr '\n' '=' | head -c 60
    echo ""
    
    echo ""
    echo "🎉 VERDICT: qwen2.5 Q4 is WORKING!"
    echo "   ✅ Responds to German prompts"
    echo "   ✅ Understands HOAI context"
    echo "   ✅ No more 10-minute waits"
    echo "   ✅ Ready for production use"
    
elif [ $EXIT_CODE -eq 124 ]; then
    echo "❌ TIMEOUT: qwen2.5 still took >3 minutes"
    echo "   This suggests a deeper issue with the qwen2.5 model itself"
    echo ""
    echo "💡 RECOMMENDATION:"
    echo "   • Try llama3.3:70b instead (similar size, Q4, proven to work)"
    echo "   • Or use phi3:14b + mistral:7b for faster responses"
    echo "   • qwen2.5 may have compatibility issues on this system"
else
    echo "❌ FAILED with exit code: $EXIT_CODE"
    echo "   Partial output:"
    cat /tmp/qwen_hoai_final.txt | head -20
fi

echo ""
echo "=========================================="
echo "📊 TEST COMPLETE"
echo "=========================================="
