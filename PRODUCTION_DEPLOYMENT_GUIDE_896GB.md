# 🚀 PRODUCTION DEPLOYMENT GUIDE - 896GB RAM SERVER

**Server Specs**: AMD EPYC 7502P | 896GB RAM | 2x960GB SATA SSD  
**Deployment Status**: READY (After fixes applied)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### 1. Apply Production Fixes (REQUIRED!)

```bash
# Run the production fixes script
./apply-production-fixes.js
```

This will:
- ✅ Create optimized database configuration (500 connections)
- ✅ Generate production environment template
- ✅ Create startup scripts with 896GB optimizations
- ✅ Apply security patches
- ✅ Set up monitoring configuration

### 2. Environment Configuration

```bash
# Copy and configure environment
cp .env.production.template .env

# Edit .env and update ALL:
# - DATABASE_URL with real credentials
# - API keys (OpenAI, Anthropic, etc)
# - Security secrets (JWT, Session)
# - Change ALL default passwords!
```

### 3. PostgreSQL Optimization

Add to `postgresql.conf`:

```conf
# MEMORY (896GB RAM optimized)
shared_buffers = 200GB
effective_cache_size = 600GB
work_mem = 1GB
maintenance_work_mem = 4GB

# CONNECTIONS
max_connections = 600

# PARALLELISM (32 cores)
max_worker_processes = 32
max_parallel_workers_per_gather = 16
max_parallel_maintenance_workers = 8
max_parallel_workers = 32

# PERFORMANCE
random_page_cost = 1.1  # For SSD
default_statistics_target = 500
```

### 4. System Optimizations

```bash
# Run as root/sudo
# Set huge pages
echo 100000 > /proc/sys/vm/nr_hugepages

# Disable NUMA balancing
echo 0 > /proc/sys/kernel/numa_balancing

# CPU performance mode
cpupower frequency-set -g performance

# Increase file limits
ulimit -n 1000000
```

### 5. Storage Setup (2x960GB SATA)

```bash
# Create RAID 1 for redundancy
mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sda /dev/sdb

# Format with XFS
mkfs.xfs -f -d agcount=32 /dev/md0

# Mount with optimizations
mount -o noatime,nodiratime,nobarrier,logbufs=8 /dev/md0 /data

# Create directories
mkdir -p /data/construction-syndicate
mkdir -p /data/postgresql
mkdir -p /data/models
mkdir -p /data/logs
```

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Install Dependencies

```bash
# Install system dependencies
sudo apt update
sudo apt install -y postgresql-14 redis-server nginx

# Install PM2 for process management
npm install -g pm2

# Install project dependencies
pnpm install
```

### Step 2: Database Setup

```bash
# Create database
sudo -u postgres createdb construction_syndicate

# Run migrations (if any)
# node migrate.js

# Verify connection pool
psql -U postgres -c "SHOW max_connections;"  # Should show 600
```

### Step 3: Start Services

```bash
# Option 1: Use optimized startup script
./start-production.sh

# Option 2: Use PM2 directly
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit
```

### Step 4: Verify Deployment

```bash
# Check system health
curl http://localhost:3003/health

# Check metrics
curl http://localhost:9090/metrics

# Check GUI
open http://localhost:3002

# Monitor logs
pm2 logs construction-syndicate
```

---

## 📊 EXPECTED PERFORMANCE

With all optimizations applied:

### Memory Usage
- **LLM Models (Quantized)**: 175GB (was 700GB)
- **In-Memory Caches**: 300GB
- **PostgreSQL**: 200GB
- **Worker Processes**: 200GB
- **Free Memory**: ~21GB

### Capacity
- **Concurrent Agents**: 200+ (was 50)
- **Database Connections**: 500 (was 20)
- **Concurrent Plans**: 300+ (was 30)
- **Inference Speed**: 3.8x faster

### Throughput
- **Plans/Hour**: 100+
- **API Requests/Sec**: 1000+
- **Database Queries/Sec**: 5000+

---

## 🛡️ SECURITY REMINDERS

1. **Change ALL default passwords**
2. **Use environment variables only** (no hardcoded credentials)
3. **Enable firewall** (only expose necessary ports)
4. **Set up SSL certificates** for web GUI
5. **Regular security updates**
6. **Monitor access logs**

---

## 🔍 MONITORING

### Key Metrics to Watch

```bash
# Memory usage
free -h

# CPU usage
htop

# Database connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Application metrics
curl http://localhost:9090/metrics | grep -E "(memory|cpu|connections)"
```

### Alerts to Configure

- Memory > 850GB
- CPU > 80%
- Database connections > 450
- Error rate > 5%
- Response time > 5 seconds

---

## 🚨 TROUBLESHOOTING

### If system won't start:
1. Check environment variables: `env | grep DATABASE`
2. Verify PostgreSQL is running: `systemctl status postgresql`
3. Check logs: `pm2 logs`

### If out of memory:
1. Check quantization: Models should be ~175GB total
2. Clear caches: `redis-cli FLUSHALL`
3. Restart with lower concurrency

### If database errors:
1. Check connection pool: Should be 500 max
2. Verify PostgreSQL tuning applied
3. Check for connection leaks

---

## 📞 EMERGENCY PROCEDURES

### System Crash Recovery

```bash
# 1. Stop all services
pm2 stop all

# 2. Clear caches
redis-cli FLUSHALL

# 3. Check disk space
df -h

# 4. Restart PostgreSQL
sudo systemctl restart postgresql

# 5. Start with reduced capacity
NODE_OPTIONS="--max-old-space-size=409600" pm2 start ecosystem.config.js
```

### Rollback Procedure

```bash
# 1. Stop current version
pm2 stop construction-syndicate

# 2. Restore previous version
git checkout <previous-commit>

# 3. Reinstall dependencies
pnpm install

# 4. Restart
pm2 start ecosystem.config.js --env production
```

---

## ✅ FINAL NOTES

1. **This system requires ALL fixes to be applied** before production use
2. **Monitor closely for first 48 hours** after deployment
3. **Keep backups** of database and configuration
4. **Document any custom changes** for future reference
5. **Train operators** on emergency procedures

**Estimated deployment time**: 2-4 hours (including optimizations)

**Support**: Create issues in the repository for production problems

---

**REMEMBER**: The system is powerful but requires proper configuration to utilize the 896GB RAM effectively. Follow EVERY step for optimal performance! 🚀
