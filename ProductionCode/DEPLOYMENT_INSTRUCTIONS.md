# 🚀 CONSTRUCTION SYNDICATE - PRODUCTION DEPLOYMENT GUIDE

## Prerequisites Complete
- ✅ Ubuntu 24.04 LTS installed
- ✅ Node.js 20.19.5 installed  
- ✅ PostgreSQL 16 configured (150GB shared_buffers)
- ✅ Ollama running with 5 models
- ✅ All code files uploaded

## STEP-BY-STEP DEPLOYMENT

### 1. Setup Database (5 min)

```bash
cd ~/deployment_package_20251016_074413/codebase

# Initialize database schema
node scripts/initialize-production-database.js

# Verify tables created
psql -U postgres -d construction_syndicate -c "\dt"
```

### 2. Configure Environment

```bash
# .env is already created with:
# - DATABASE_URL=postgresql://postgres:ConstructionAI2024@localhost:5432/construction_syndicate
# - NODE_ENV=production
# - All model names matching ollama list

# Verify it's correct
cat .env | grep DATABASE_URL
```

### 3. Launch System

```bash
# Make launcher executable
chmod +x launch-construction-syndicate.sh

# Launch with 64GB heap
./launch-construction-syndicate.sh

# System will start and should show:
# ✅ Database connected
# ✅ 8 models loaded
# ✅ QuantumTensorEngine active
# ✅ Construction services initialized
```

### 4. Verify Health

```bash
# In another terminal
node scripts/health-check.js

# Should show:
# ✅ Database: Connected
# ✅ Ollama: Connected (5 models)
# ✅ Web GUI: Running
```

### 5. Access Web GUI

Open browser:
- **Local:** http://localhost:3001
- **External:** http://162.55.83.33:3001

## Troubleshooting

### Database Connection Fails
```bash
# Reset password
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'ConstructionAI2024';"

# Test connection
psql -U postgres -d construction_syndicate -h localhost -c "SELECT NOW();"
```

### Models Not Loading
```bash
# List available models
ollama list

# Update .env with exact names from ollama list
```

### Out of Memory
```bash
# Check heap size in launch script
grep "max-old-space-size" launch-construction-syndicate.sh

# Should be: --max-old-space-size=65536 (64GB)
```

## System Requirements Met

- ✅ 896GB RAM (881GB available)
- ✅ 32 cores / 64 threads
- ✅ PostgreSQL 16 with 150GB shared_buffers
- ✅ Node.js 20.19.5
- ✅ All LLM models loaded

## Expected Memory Usage

- PostgreSQL: ~150GB (shared_buffers)
- Ollama Models: ~400GB (5 FP16 models)
- Node.js: ~64GB (heap)
- QuantumTensorEngine: ~20GB (tensor cache)
- System/Other: ~100GB
- **Total:** ~734GB / 896GB (82% utilization)

## Success Indicators

1. **No database errors** in logs
2. **No TensorFlow errors** (using QuantumEngine)
3. **No unhandled rejections**
4. **Web GUI accessible** on port 3001
5. **LLM responds** to chat queries
6. **System runs continuously** without crashes

