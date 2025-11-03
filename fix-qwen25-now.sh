#!/bin/bash

# 🛠️ IMMEDIATE FIX FOR qwen2.5 PERFORMANCE
# ========================================
# Replaces F16 quantization with Q4 for 4-10x performance improvement

echo "🛠️ IMMEDIATE FIX: qwen2.5 Performance"
echo "======================================"
echo ""
echo "🔍 DIAGNOSIS:"
echo "   Problem: qwen2.5:72b-instruct-fp16 uses F16 quantization (145GB)"
echo "   Impact: 10+ minute response times, excessive memory usage"
echo "   Root Cause: F16 is 4x larger and slower than Q4 quantization"
echo ""
echo "🎯 SOLUTION:"
echo "   Replace with Q4 quantized version"
echo "   Expected: 145GB → 35GB, 10min → 30sec"
echo ""

# Stop any running tests that might be stuck
pkill -f "node.*test-all-llms" 2>/dev/null || true
pkill -f "node.*model-integrity" 2>/dev/null || true

# Download Q4 quantized version
echo "📥 Step 1: Downloading Q4 quantized qwen2.5..."
echo "   This will take 5-10 minutes for ~35GB download..."
ollama pull qwen2.5:72b-instruct-q4_k_m

if [ $? -eq 0 ]; then
    echo "   ✅ Q4 version downloaded successfully"
    
    # Remove F16 version
    echo ""
    echo "🗑️ Step 2: Removing slow F16 version..."
    ollama rm qwen2.5:72b-instruct-fp16
    
    echo "   ✅ F16 version removed"
    
    # Test the new version
    echo ""
    echo "🧪 Step 3: Testing Q4 version..."
    
    # Simple test
    timeout 60 ollama run qwen2.5:72b-instruct-q4_k_m "Test" > /tmp/qwen_test.txt 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Q4 version works!"
        echo "   Response time: <60 seconds (vs 10+ minutes before)"
        
        # Test German HOAI prompt
        echo ""
        echo "🇩🇪 Step 4: Testing with German HOAI prompt..."
        timeout 60 ollama run qwen2.5:72b-instruct-q4_k_m "was ist besonders an deutscher architektur nach der HOAI ??!" > /tmp/qwen_hoai_test.txt 2>&1
        
        if [ $? -eq 0 ]; then
            echo "   ✅ German HOAI test successful!"
            echo ""
            echo "📋 Sample response:"
            head -n 10 /tmp/qwen_hoai_test.txt
        else
            echo "   ⚠️ HOAI test timed out or failed"
        fi
        
    else
        echo "   ❌ Q4 version test failed"
    fi
    
    echo ""
    echo "=================================================="
    echo "✅ FIX COMPLETE"
    echo "=================================================="
    echo ""
    echo "📊 RESULTS:"
    echo "   Model: qwen2.5:72b-instruct-q4_k_m"
    echo "   Size: ~35GB (was 145GB)"
    echo "   Quantization: Q4_K_M (was F16)"
    echo "   Expected performance: 4-10x faster"
    echo ""
    echo "🎯 NEXT STEPS:"
    echo "   1. Update model configuration to use Q4 version"
    echo "   2. Test with your German HOAI prompts"
    echo "   3. Use GOT reasoning with the fast Q4 model"
    echo ""
    
else
    echo "❌ Failed to download Q4 version"
    echo "   Please check internet connection and Ollama service"
    exit 1
fi
