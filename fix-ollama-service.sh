#!/bin/bash

# 🔧 FIX OLLAMA SERVICE CONFIGURATION
# ===================================
# Optimize Ollama for large models and fix timeout issues

echo "🔧 FIXING OLLAMA SERVICE CONFIGURATION"
echo "======================================"

# Step 1: Stop Ollama
echo "1️⃣ Stopping Ollama service..."
systemctl stop ollama
sleep 5

# Step 2: Create optimized configuration
echo "2️⃣ Creating optimized configuration..."

sudo mkdir -p /etc/systemd/system/ollama.service.d/

sudo tee /etc/systemd/system/ollama.service.d/large-models.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_CONTEXT_LENGTH=8192"
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_LOAD_TIMEOUT=10m"
Environment="OLLAMA_MAX_LOADED_MODELS=2"
Environment="OLLAMA_KEEP_ALIVE=15m"
Environment="OLLAMA_MAX_QUEUE=128"
Environment="OLLAMA_FLASH_ATTENTION=false"
Environment="OLLAMA_GPU_OVERHEAD=0"
Environment="OLLAMA_DEBUG=false"

# Memory and resource limits
LimitNOFILE=65536
LimitMEMLOCK=infinity
LimitNPROC=65536

# Process priority
Nice=-5
IOSchedulingClass=realtime
IOSchedulingPriority=1

# Restart policy  
Restart=always
RestartSec=10s
EOF

echo "   ✅ Configuration file created"

# Step 3: Reload systemd and restart Ollama
echo "3️⃣ Reloading systemd configuration..."
systemctl daemon-reload

echo "4️⃣ Starting Ollama with optimized config..."
systemctl start ollama

sleep 10

# Step 4: Verify Ollama is running
echo "5️⃣ Verifying Ollama service..."
systemctl status ollama --no-pager | tail -15

echo ""

# Step 5: Wait for Ollama to be ready
echo "6️⃣ Waiting for Ollama to be fully ready..."
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "   ✅ Ollama is responding"
        break
    fi
    echo "   ⏳ Waiting... ($i/30)"
    sleep 2
done

# Step 6: List available models
echo ""
echo "7️⃣ Available models:"
curl -s http://localhost:11434/api/tags | python3 -c "import sys, json; data=json.load(sys.stdin); [print(f\"   • {m['name']} ({round(m['size']/1e9,1)}GB, {m['details']['quantization_level']})\") for m in data['models']]"

echo ""
echo "=================================================="
echo "✅ OLLAMA SERVICE OPTIMIZATION COMPLETE"
echo "=================================================="
echo ""
echo "🎯 Optimizations applied:"
echo "   • 10-minute load timeout (was 5m)"
echo "   • 15-minute keep-alive (prevents unloading)"
echo "   • Increased queue size (128)"
echo "   • Single parallel processing"
echo "   • Realtime I/O priority"
echo ""
echo "🧪 Next: Test models with optimized service"
