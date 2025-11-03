# ⚡ QUICK DEPLOYMENT REFERENCE
## Elite Construction AI Syndicate - One-Page Guide

### 📦 Package for Deployment
```bash
./scripts/package-for-deployment.sh my-deployment
scp deployment-packages/my-deployment.tar.gz user@server:/path/
```

### 🚀 Deploy on Server
```bash
tar -xzf my-deployment.tar.gz
cd my-deployment
./deploy.sh
```

### 💾 Manual Backup (Anytime)
```bash
./scripts/manual-backup.sh
# or
./scripts/manual-backup.sh "backup-name"
```

### 🛑 Stop (Auto-Backup)
```bash
pm2 stop construction-syndicate
# ✅ Automatic backup created in backups/
```

### 🔄 Restore from Backup
```bash
./scripts/restore-from-backup.sh shutdown_TIMESTAMP
```

### 🌍 Move to New Server
```bash
# Old Server:
pm2 stop construction-syndicate
scp backups/shutdown_*.tar.gz user@newserver:/path/

# New Server:
tar -xzf shutdown_*.tar.gz
./scripts/restore-from-backup.sh shutdown_TIMESTAMP
pm2 start ecosystem.config.js
```

### 📊 Check Status
```bash
pm2 status
pm2 logs
pm2 monit
```

### 🗂️ Backup Locations
- **Shutdown backups**: `backups/shutdown_TIMESTAMP.tar.gz`
- **Manual backups**: `backups/manual_TIMESTAMP.tar.gz`
- **Deployment packages**: `deployment-packages/*.tar.gz`

### ✅ What's Preserved
- ✅ All agent learning & memory
- ✅ Complete database
- ✅ Collective intelligence
- ✅ Uploaded plans & annotations
- ✅ System configuration

### 🔥 Emergency Recovery
```bash
# Find latest backup
ls -t backups/*.tar.gz | head -n1

# Extract and restore
tar -xzf [latest-backup]
./scripts/restore-from-backup.sh [backup-name]
pm2 start ecosystem.config.js
```

---

**Complete portability. Zero learning loss. Your server, your rules.** 🚀
