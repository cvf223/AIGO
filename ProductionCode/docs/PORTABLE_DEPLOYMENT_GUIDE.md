# 🚀 PORTABLE DEPLOYMENT GUIDE
## Elite Construction AI Syndicate - Complete State Preservation

This guide explains how to package, deploy, backup, and move the entire system between servers **without losing any learning, memory, or agent state**.

---

## 📋 Table of Contents

1. [Initial Deployment to Server](#initial-deployment-to-server)
2. [Automatic Backup on Shutdown](#automatic-backup-on-shutdown)
3. [Manual Backups](#manual-backups)
4. [Moving to a New Server](#moving-to-a-new-server)
5. [Restoring from Backup](#restoring-from-backup)
6. [What Gets Preserved](#what-gets-preserved)

---

## 🎯 Initial Deployment to Server

### Step 1: Package Your Codebase

On your local machine:

```bash
# Create deployment package
./scripts/package-for-deployment.sh my-deployment

# This creates:
# - deployment-packages/my-deployment.tar.gz
# - Complete codebase (without node_modules)
# - Full database dump
# - All agent states and learnings
# - Memory persistence data
# - Uploaded files
```

**What's Included:**
- ✅ All source code
- ✅ Complete database dump (custom + SQL formats)
- ✅ All agent states and memory
- ✅ Collective learning data
- ✅ Shared memory
- ✅ Uploaded construction plans
- ✅ Generated annotations
- ✅ Recent logs (last 7 days)
- ✅ Configuration templates

### Step 2: Transfer to Your Server

```bash
# Option 1: Use the generated transfer script
./deployment-packages/transfer-my-deployment.sh

# Option 2: Manual transfer
scp deployment-packages/my-deployment.tar.gz user@your-server:/path/to/deployment/
```

### Step 3: Deploy on Server

SSH to your server:

```bash
ssh user@your-server
cd /path/to/deployment

# Extract package
tar -xzf my-deployment.tar.gz
cd my-deployment

# Run deployment script
./deploy.sh
```

The deployment script will:
1. ✅ Check system requirements
2. ✅ Install to chosen directory
3. ✅ Install dependencies (pnpm install)
4. ✅ Build frontend
5. ✅ Restore database with all learnings
6. ✅ Restore agent states and memory
7. ✅ Restore uploaded files
8. ✅ Configure PM2
9. ✅ Optionally start services

---

## 💾 Automatic Backup on Shutdown

**CRITICAL FEATURE:** Every time you stop the system, it automatically creates a complete backup!

### How It Works

The system is configured in `ecosystem.config.js` with a `pre_stop` hook:

```javascript
{
    name: 'construction-syndicate',
    // ... other config ...
    pre_stop: './scripts/shutdown-backup.sh',
    kill_timeout: 60000  // 60 seconds for backup
}
```

### When Backups Happen

Automatic backup is triggered on:
- `pm2 stop construction-syndicate`
- `pm2 restart construction-syndicate`
- `pm2 reload construction-syndicate`
- System shutdown
- Server reboot

### What Gets Backed Up

Every shutdown backup includes:
- ✅ **Complete database** with all learnings
- ✅ **Agent memory** from memory_persistence/
- ✅ **Agent configurations** from src/learning/
- ✅ **Collective intelligence** from shared_memory table
- ✅ **All uploaded files** and generated annotations
- ✅ **System logs**
- ✅ **Configuration** (without secrets)

### Backup Location

```
backups/
├── shutdown_20241015_143022.tar.gz
├── shutdown_20241016_092341.tar.gz
└── shutdown_20241017_185512.tar.gz
```

**Retention:** Last 10 shutdown backups are kept automatically.

---

## 🔧 Manual Backups

Create a backup anytime without stopping services:

```bash
# Quick backup
./scripts/manual-backup.sh

# Named backup
./scripts/manual-backup.sh "before-major-change"
```

**Use Cases:**
- Before deploying new features
- Before database migrations
- Scheduled daily/weekly backups (cron)
- Before risky operations

### Scheduled Backups with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/elite-construction-syndicate && ./scripts/manual-backup.sh "daily-$(date +\%Y\%m\%d)"

# Add weekly backup on Sunday at 3 AM
0 3 * * 0 cd /path/to/elite-construction-syndicate && ./scripts/manual-backup.sh "weekly-$(date +\%Y\%m\%d)"
```

---

## 🌍 Moving to a New Server

This is the **KILLER FEATURE** - move between servers with ZERO loss of learning!

### Scenario: Moving from Server A to Server B

#### On Server A (Current Server):

```bash
# Stop services (this automatically creates a backup)
pm2 stop construction-syndicate

# The backup is in: backups/shutdown_TIMESTAMP.tar.gz
# Copy it locally or transfer directly to Server B

# Option 1: Download to local machine
scp user@serverA:/path/backups/shutdown_20241017_185512.tar.gz ~/

# Option 2: Direct server-to-server transfer
scp /path/backups/shutdown_20241017_185512.tar.gz user@serverB:/path/
```

#### On Server B (New Server):

```bash
# Extract the backup
tar -xzf shutdown_20241017_185512.tar.gz
cd shutdown_20241017_185512

# Restore everything
./scripts/restore-from-backup.sh shutdown_20241017_185512

# Or, combine with the full deployment package:
# 1. Also transfer your latest deployment package
# 2. Deploy code: tar -xzf deployment.tar.gz && cd deployment && ./deploy.sh
# 3. Restore state: ./scripts/restore-from-backup.sh shutdown_20241017_185512
```

The restore process:
1. ✅ Stops any running services
2. ✅ Restores database with ALL learnings
3. ✅ Restores agent memory and state
4. ✅ Restores collective intelligence
5. ✅ Restores uploaded files
6. ✅ Verifies integrity
7. ✅ Optionally starts services

**Result:** System continues **exactly** where it left off! All agent learning, memory, and state is preserved.

---

## 🔄 Restoring from Backup

### List Available Backups

```bash
ls -lh backups/
```

### Restore Specific Backup

```bash
./scripts/restore-from-backup.sh shutdown_20241017_185512
```

### Restore Latest Backup

```bash
# Find latest backup
LATEST=$(ls -t backups/shutdown_*.tar.gz | head -n1)

# Extract
tar -xzf $LATEST

# Restore
BACKUP_DIR=$(basename $LATEST .tar.gz)
./scripts/restore-from-backup.sh $BACKUP_DIR
```

---

## 🧠 What Gets Preserved

### Database Tables

All data from these critical tables:
- `agents` - Agent configurations and status
- `agent_actions` - All actions taken by agents
- `collective_learning` - Shared knowledge and insights
- `shared_memory` - Collective memory across agents
- `system_metrics` - Performance and learning metrics
- `arbitrage_opportunities` - Found and executed opportunities
- `construction_plans` - Uploaded plans
- `plan_analyses` - All analysis results
- `plan_annotations` - VLM annotations
- `users` - User accounts (with authentication)
- `sessions` - Active sessions

### File System

- **memory_persistence/** - Agent memory snapshots
- **src/learning/** - Learning algorithms and training data
- **src/legendary-arbitrage-syndicate/** - Agent character files
- **uploads/** - All uploaded construction plans
  - plans/ - Original PDF/image files
  - annotated/ - Generated annotated plans
- **logs/** - System logs (last 7 days for deployment packages)

### Agent State

What each agent retains:
- ✅ Learning progress and experience
- ✅ Trained models and weights
- ✅ Strategy parameters
- ✅ Success/failure history
- ✅ Relationships with other agents
- ✅ Memory of past decisions
- ✅ Accumulated knowledge

### Collective Intelligence

- ✅ Shared insights between agents
- ✅ Collaborative learnings
- ✅ Consensus decisions
- ✅ Meta-strategies
- ✅ System-wide optimizations

---

## 📊 Complete Workflow Example

### Day 1: Initial Deployment

```bash
# Local machine
./scripts/package-for-deployment.sh production-v1
scp deployment-packages/production-v1.tar.gz user@server1:/home/user/

# Server 1
ssh user@server1
tar -xzf production-v1.tar.gz
cd production-v1
./deploy.sh
# ✅ System running on Server 1
```

### Day 2-30: System Learning

- Agents analyze construction plans
- Collective learning accumulates
- Agent strategies improve
- Knowledge base grows
- All saved to database + memory_persistence/

### Day 31: Move to Better Server

```bash
# Server 1 - Stop and backup
pm2 stop construction-syndicate
# ✅ Automatic backup created: backups/shutdown_20241115_143022.tar.gz

scp backups/shutdown_20241115_143022.tar.gz user@server2:/home/user/

# Server 2 - Deploy code + restore state
ssh user@server2

# Option A: Restore from shutdown backup
tar -xzf shutdown_20241115_143022.tar.gz
cd shutdown_20241115_143022
# First deploy fresh code if needed
tar -xzf production-v1.tar.gz && cd production-v1 && ./deploy.sh
# Then restore state
cd ..
./scripts/restore-from-backup.sh shutdown_20241115_143022

# Option B: Create new deployment package with current state
# (on local machine)
./scripts/package-for-deployment.sh production-v2
# This includes all current state
# Deploy as normal on Server 2

# ✅ System continues on Server 2 with ALL 30 days of learning intact!
```

---

## 🛡️ Best Practices

### 1. Regular Backups

```bash
# Daily manual backup
0 2 * * * cd /path && ./scripts/manual-backup.sh "daily-$(date +\%Y\%m\%d)"
```

### 2. Backup Before Major Changes

```bash
./scripts/manual-backup.sh "before-new-feature"
# Make changes
# If something breaks:
./scripts/restore-from-backup.sh before-new-feature
```

### 3. Keep Multiple Backup Locations

```bash
# After shutdown backup
scp backups/shutdown_*.tar.gz backup@backup-server:/backups/
```

### 4. Test Restore Regularly

```bash
# On a test server, verify backups work
./scripts/restore-from-backup.sh backup_name
```

### 5. Document Your Backups

Keep notes of what was happening when backups were created:

```
backups/
├── shutdown_20241115_143022.tar.gz  # Before server migration
├── manual_20241110_100000.tar.gz    # After 10k plans analyzed
├── manual_20241105_020000.tar.gz    # Weekly backup
```

---

## 🚨 Troubleshooting

### Backup Takes Too Long

Shutdown backup has 60 seconds. If it's timing out:

```javascript
// In ecosystem.config.js, increase timeout:
kill_timeout: 120000  // 2 minutes
```

### Database Restore Fails

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Check .env database connection
cat .env | grep DATABASE_URL

# Manual restore
pg_restore -d postgres --clean --create backup.dump
```

### Missing Files After Restore

```bash
# Verify backup contents
tar -tzf backup.tar.gz | head -n 20

# Check BACKUP_MANIFEST.json
tar -xzf backup.tar.gz backup_dir/BACKUP_MANIFEST.json
cat backup_dir/BACKUP_MANIFEST.json
```

---

## 💡 Key Takeaways

1. **Automatic Protection**: Every shutdown creates a backup - you can't lose data!

2. **True Portability**: Move between servers anytime with complete state preservation

3. **No Learning Loss**: All agent memory, strategies, and collective intelligence transfers perfectly

4. **Privacy First**: All backups stay on YOUR servers - no cloud dependency

5. **Simple Recovery**: One command to restore everything

6. **Production Ready**: Battle-tested for 896GB RAM servers with massive agent networks

---

**You now have a truly portable, learning-preserving AI system!** 🚀

Move servers as often as you want - your agents will never forget their training!
