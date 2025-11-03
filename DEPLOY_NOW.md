# 🚀 DEPLOY CONSTRUCTION AI TO SERVER - QUICK GUIDE

## ✅ DEPLOYMENT PACKAGE READY!

**Package**: `deployment_backups/construction-ai-production-20251022_165911.tar.gz`
**Size**: 35MB
**Status**: Ready to deploy

## 📤 DEPLOYMENT STEPS

### Option 1: Automated Deployment (Recommended)

```bash
# Set your server details
export SERVER_USER="your-username"
export SERVER_HOST="your-server-ip"

# Run automated deployment
./deploy-to-server.sh
```

### Option 2: Manual Deployment

#### Step 1: Upload Package

```bash
# Get the latest package
PACKAGE=$(ls -t deployment_backups/*.tar.gz | head -1)

# Upload to server
scp $PACKAGE your-username@your-server:/tmp/

# Example:
# scp deployment_backups/construction-ai-production-20251022_165911.tar.gz root@192.168.1.100:/tmp/
```

#### Step 2: Install on Server

SSH into your server and run:

```bash
# Connect to server
ssh your-username@your-server

# Create application directory
sudo mkdir -p /opt/construction-ai
cd /opt/construction-ai

# Backup existing installation (if any)
if [ -d "src" ]; then
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    sudo mkdir -p backups
    sudo tar -czf backups/${BACKUP_NAME}.tar.gz src/ package.json 2>/dev/null || true
    echo "Backup saved to backups/${BACKUP_NAME}.tar.gz"
fi

# Extract new deployment
sudo tar -xzf /tmp/construction-ai-production-*.tar.gz -C /opt/construction-ai/

# Set permissions
sudo chown -R $USER:$USER /opt/construction-ai

# Install pnpm if needed
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi

# Install dependencies
pnpm install --prod

# Create required directories
mkdir -p uploads output logs golden_dataset

# Configure environment
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration:"
    echo "   nano .env"
fi
```

#### Step 3: Configure Environment

Edit the `.env` file with your settings:

```bash
nano /opt/construction-ai/.env
```

Key settings to update:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET` (generate a strong secret)
- `STLB_API_KEY`, `ALCHEMY_API_KEY` (if you have them)

#### Step 4: Run Tests

```bash
cd /opt/construction-ai

# Run comprehensive test suite
node src/construction/tests/ComprehensiveTestSuite.js
```

#### Step 5: Start Production Server

**Option A: Direct Start**
```bash
./start-production.sh
```

**Option B: With Docker**
```bash
./start-production.sh docker
```

**Option C: With PM2**
```bash
pm2 start src/construction/server.js --name construction-ai -i max
pm2 save
pm2 startup
```

## 🔍 VERIFY DEPLOYMENT

### Check Server Status

```bash
# If running directly
curl http://localhost:3000/api/v1/health

# If running on remote server
curl http://your-server-ip:3000/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T...",
  "uptime": 123.45,
  "activeJobs": 0,
  "queuedJobs": 0
}
```

### View Logs

```bash
# Server logs
tail -f /opt/construction-ai/logs/combined.log

# Error logs
tail -f /opt/construction-ai/logs/error.log

# PM2 logs (if using PM2)
pm2 logs construction-ai
```

## 📊 MONITORING

### Access Monitoring Dashboards (if using Docker)

- **Prometheus**: http://your-server-ip:9090
- **Grafana**: http://your-server-ip:3001
  - Default login: admin / admin (change immediately!)

## 🧪 TEST THE DEPLOYMENT

### Test with Sample Plan

```bash
cd /opt/construction-ai

# If you have test plans in the repo
curl -X POST http://localhost:3000/api/v1/analyze/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "plan=@test-data/plans/sample.png"
```

## 🔒 SECURITY CHECKLIST

- [ ] Changed all default passwords in `.env`
- [ ] Generated strong JWT secret
- [ ] Configured SSL/TLS certificates
- [ ] Set up firewall rules (allow ports 80, 443, 3000)
- [ ] Configured CORS origin restrictions
- [ ] Set up backup strategy
- [ ] Enabled monitoring and alerting

## 🆘 TROUBLESHOOTING

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U construction_user -d construction_materials -h localhost
```

### Out of Memory

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or edit start script
```

## 📞 SUPPORT

If you encounter issues:

1. Check logs: `/opt/construction-ai/logs/`
2. Verify environment variables: `cat .env`
3. Check system resources: `htop` or `top`
4. Review test results: `/opt/construction-ai/test-output/`

## 🎉 SUCCESS!

Once deployed:
- API available at: `http://your-server-ip:3000`
- Upload construction plans via API
- Generate Ausschreibung documents
- Create LP6 deliverables
- Get pixel-precise verification reports

---

**Deployment Package**: Ready in `deployment_backups/`
**Next Step**: Run `./deploy-to-server.sh` or follow manual steps above

