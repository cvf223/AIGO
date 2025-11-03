# 🔄 SERVER DATA MIRRORING SYSTEM

## Quick Start

### First Time Setup (Using ZIP)

```bash
# 1. Run initial sync (uses ZIP for large transfer)
./initial-sync.sh

# This will:
# - Create ZIP on server (excludes node_modules, logs, large files)
# - Download ZIP to local
# - Extract to ServerData/
```

### Regular Updates (Incremental)

```bash
# Pull latest changes from server to local
./mirror

# Or explicitly
./mirror pull
```

### Push Changes to Server

```bash
./mirror push
```

---

## Directory Structure

```
Multi-Agent-AI-Framework/
├── ServerData/              ← Mirrored server data (local copy)
│   ├── src/
│   ├── data/
│   ├── database/
│   └── ...
├── mirror                   ← Simple mirror command
├── mirror-from-server.sh    ← Pull from server (incremental)
├── mirror-to-server.sh      ← Push to server
├── initial-sync.sh          ← First-time ZIP sync
└── create-server-mirror-scripts.sh
```

**On Server** (`~/ProductionCode/`):
```
ProductionCode/
├── mirror                   ← Simple mirror command
├── mirror-pull.sh          ← Pull from local machine
├── mirror-push.sh          ← Push to local machine
└── ...
```

---

## Commands Reference

### Local Machine Commands

```bash
# First sync (ZIP-based, for initial large transfer)
./initial-sync.sh

# Pull updates from server (incremental)
./mirror
./mirror pull

# Push changes to server
./mirror push

# Check mirror status
./mirror status
```

### Server Commands

```bash
ssh root@162.55.83.33
cd ~/ProductionCode

# Pull changes from local machine
./mirror pull

# Push changes to local machine  
./mirror push

# Check status
./mirror status
```

---

## What Gets Synced

### ✅ Included
- Source code (`src/`)
- Configuration files
- Database schemas (`database/`)
- Data files (small)
- Scripts and utilities
- Documentation

### ❌ Excluded (Automatically)
- `node_modules/` - Install locally with pnpm
- `.git/` - Use git for version control
- `*.log` - Server logs (too large/changing)
- `uploads/*` - User uploads
- `backups/*` - Server backups
- `deployment-packages/*.tar.gz` - Large archives
- `data/transaction-tracking.json` - Huge transaction log
- Temporary files (`.tmp`, `.swp`)

---

## Setup Server-Side Mirror (One-Time)

### Get Your Local IP Address

```bash
# On macOS
ipconfig getifaddr en0

# Or check network settings
```

### Configure Server Scripts

```bash
ssh root@162.55.83.33
cd ~/ProductionCode

# Edit mirror-pull.sh
nano mirror-pull.sh
# Replace YOUR_LOCAL_IP with your actual IP (e.g., 192.168.1.100)

# Edit mirror-push.sh  
nano mirror-push.sh
# Replace YOUR_LOCAL_IP with your actual IP

# Save and exit (Ctrl+X, Y, Enter)
```

### Enable SSH Key Authentication

If not already set up:

```bash
# On local machine
ssh-copy-id root@162.55.83.33

# Test
ssh root@162.55.83.33 "echo Connected!"
```

For reverse connection (server to local), you'll need to:
1. Enable Remote Login on your Mac (System Preferences → Sharing → Remote Login)
2. Add server's SSH key to local authorized_keys

---

## Usage Examples

### Scenario 1: Pull Latest Server Code

```bash
# On local machine
./mirror

# Check what was synced
ls -la ServerData/src/construction/
```

### Scenario 2: Push Local Changes to Server

```bash
# After editing files in ServerData/
./mirror push

# Server will have your changes
```

### Scenario 3: Two-Way Sync

```bash
# Pull latest from server
./mirror pull

# Make changes locally in ServerData/

# Push changes back
./mirror push
```

### Scenario 4: Server-Initiated Sync

```bash
# On server
ssh root@162.55.83.33
cd ~/ProductionCode

# Pull changes from local
./mirror pull

# Or push to local
./mirror push
```

---

## Advanced Options

### Selective Sync

Edit `mirror-from-server.sh` to customize exclusions:

```bash
rsync -avz \
    --exclude='your-folder/*' \
    ...
```

### Dry Run (Preview)

```bash
# See what would be synced without actually syncing
rsync -avz --dry-run \
    root@162.55.83.33:~/ProductionCode/ \
    ./ServerData/
```

### Bandwidth Limit

```bash
# Limit to 1MB/s
rsync -avz --bwlimit=1024 \
    ...
```

---

## Troubleshooting

### "Permission denied" errors

```bash
# Ensure SSH keys are set up
ssh-copy-id root@162.55.83.33
```

### "Connection refused" for reverse sync

1. Enable Remote Login on Mac
2. Check firewall settings
3. Verify local IP address is correct in server scripts

### Large files causing slow sync

Add to exclusions in mirror scripts:
```bash
--exclude='path/to/large/file.tar.gz'
```

### Sync conflicts

```bash
# If files conflict, server always wins on pull:
./mirror pull

# Local always wins on push:
./mirror push
```

---

## Workflow Recommendations

### Development Workflow

1. **Pull** latest from server
2. **Edit** in `ServerData/`
3. **Test** locally
4. **Push** to server
5. **Restart** server to apply changes

### Backup Before Push

```bash
# Server automatically creates backups before pull
# Check backups:
ssh root@162.55.83.33 "ls -lh ~/ProductionCode/backups/"
```

---

## Performance

### Initial Sync (ZIP)
- Time: ~5-10 minutes (depending on data size)
- Size: ~50MB compressed
- Method: ZIP compression

### Incremental Sync (rsync)
- Time: <30 seconds (only changed files)
- Bandwidth: Minimal
- Method: rsync delta transfer

---

## Security Notes

- SSH keys recommended over passwords
- Use VPN if syncing over public network
- Backup before major syncs
- Review changes before pushing to production

---

## Quick Reference

```bash
# LOCAL COMMANDS
./initial-sync.sh    # First time only
./mirror             # Pull from server
./mirror push        # Push to server
./mirror status      # Check status

# SERVER COMMANDS  
ssh root@162.55.83.33
./mirror pull        # Pull from local
./mirror push        # Push to local
./mirror status      # Check status
```

---

*Mirroring system ready!*  
*Sync your server data efficiently* 🔄

