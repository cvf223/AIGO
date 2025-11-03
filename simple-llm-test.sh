#!/bin/bash

# 🧪 SIMPLE LLM TEST - German HOAI Prompt
# =======================================

echo "🧪 SIMPLE LLM TEST - German HOAI Architecture"
echo "=============================================="
echo ""

PROMPT="was ist besonders an deutscher architektur nach der HOAI ??!"

# Test phi3:14b (fastest, should work)
echo "1️⃣ Testing phi3:14b (fast, small model)..."
timeout 60 ollama run phi3:14b "$PROMPT" > /tmp/phi3_test.txt 2>&1

if [ $? -eq 0 ]; then
    echo "✅ phi3:14b SUCCESS"
    wc -c /tmp/phi3_test.txt
    head -c 300 /tmp/phi3_test.txt
    echo ""
else
    echo "❌ phi3:14b FAILED or timed out"
fi

echo ""

# Test mistral (medium size)
echo "2️⃣ Testing mistral:7b-instruct-fp16..."
timeout 60 ollama run mistral:7b-instruct-fp16 "$PROMPT" > /tmp/mistral_test.txt 2>&1

if [ $? -eq 0 ]; then
    echo "✅ mistral SUCCESS"
    wc -c /tmp/mistral_test.txt
    head -c 300 /tmp/mistral_test.txt
    echo ""
else
    echo "❌ mistral FAILED or timed out"
fi

echo ""

# Test llama3.3 (large but Q4)
echo "3️⃣ Testing llama3.3:70b (large Q4 model)..."
timeout 120 ollama run llama3.3:70b "$PROMPT" > /tmp/llama_test.txt 2>&1

if [ $? -eq 0 ]; then
    echo "✅ llama3.3 SUCCESS"
    wc -c /tmp/llama_test.txt
    head -c 300 /tmp/llama_test.txt
    echo ""
else
    echo "❌ llama3.3 FAILED or timed out"
fi

echo ""
echo "=============================================="
echo "📊 SIMPLE TEST COMPLETE"
echo "=============================================="
echo ""
echo "Check /tmp/*_test.txt for full responses"
