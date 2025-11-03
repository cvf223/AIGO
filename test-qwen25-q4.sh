#!/bin/bash

# 🧪 TEST qwen2.5 Q4 VERSION
# =========================
# Quick test of the new optimized Q4 model

echo "🧪 TESTING qwen2.5 Q4 VERSION"
echo "============================="
echo ""

# Test 1: Simple connectivity test
echo "1️⃣ Simple connectivity test..."
timeout 30 curl -s -X POST http://localhost:11434/api/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen2.5:72b-instruct-q4_k_m",
    "prompt": "Hello, respond briefly.",
    "stream": false,
    "options": {
      "num_predict": 50
    }
  }' | python3 -c "import sys, json; data=json.load(sys.stdin); print('✅ Response:', data.get('response', 'N/A')[:100]); print('⏱️ Duration:', round((data.get('total_duration', 0) or 0) / 1000000000, 2), 'seconds')"

if [ $? -eq 0 ]; then
    echo "   ✅ Simple test PASSED"
else
    echo "   ❌ Simple test FAILED or timed out"
fi

echo ""

# Test 2: German HOAI prompt
echo "2️⃣ German HOAI architecture prompt test..."
echo "   Prompt: 'was ist besonders an deutscher architektur nach der HOAI ??!'"
echo ""

timeout 60 curl -s -X POST http://localhost:11434/api/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "qwen2.5:72b-instruct-q4_k_m",
    "prompt": "was ist besonders an deutscher architektur nach der HOAI ??!",
    "stream": false,
    "options": {
      "temperature": 0.7,
      "num_predict": 500
    }
  }' > /tmp/qwen_hoai_response.json 2>&1

if [ $? -eq 0 ]; then
    echo "✅ HOAI test completed successfully!"
    echo ""
    echo "📊 Response analysis:"
    python3 << 'PYTHON_SCRIPT'
import json
try:
    with open('/tmp/qwen_hoai_response.json', 'r') as f:
        data = json.load(f)
    
    response = data.get('response', '')
    total_duration = data.get('total_duration', 0) / 1000000000  # Convert to seconds
    load_duration = data.get('load_duration', 0) / 1000000000
    eval_duration = data.get('eval_duration', 0) / 1000000000
    
    # Count German terms
    hoai_count = response.lower().count('hoai')
    architektur_count = response.lower().count('architektur')
    deutsch_count = response.lower().count('deutsch')
    
    print(f"   ⏱️ Total time: {total_duration:.2f} seconds")
    print(f"   ⏱️ Load time: {load_duration:.2f} seconds")
    print(f"   ⏱️ Eval time: {eval_duration:.2f} seconds")
    print(f"   📊 Response length: {len(response)} characters")
    print(f"   🇩🇪 HOAI mentions: {hoai_count}")
    print(f"   🏗️ Architektur mentions: {architektur_count}")
    print(f"   🇩🇪 Deutsch mentions: {deutsch_count}")
    print("")
    print("📋 Response preview (first 300 chars):")
    print(response[:300] + "...")
    
    # Success check
    if total_duration < 60 and len(response) > 100:
        print("")
        print("🎉 SUCCESS: Q4 model is working properly!")
        print(f"   Response time: {total_duration:.2f}s (vs 10+ minutes with F16)")
    else:
        print("")
        print("⚠️ Model responded but may need optimization")
        
except Exception as e:
    print(f"❌ Error parsing response: {e}")
PYTHON_SCRIPT

else
    echo "❌ HOAI test FAILED or timed out after 60 seconds"
    echo "   Check /tmp/qwen_hoai_response.json for details"
fi

echo ""
echo "=================================="
echo "📊 TEST SUMMARY"
echo "=================================="
echo "Model: qwen2.5:72b-instruct-q4_k_m"
echo "Quantization: Q4_K_M (optimized)"
echo "Size: ~47GB (vs 145GB F16)"
echo ""
echo "Next: Test with full GOT reasoning!"
