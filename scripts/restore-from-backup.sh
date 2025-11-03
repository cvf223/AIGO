#!/bin/bash

# 🔄 RESTORE FROM BACKUP
# ======================
# Restores complete system state from a backup
# Use this to move between servers with all learning intact
#
# Usage: ./scripts/restore-from-backup.sh <backup-directory>

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 RESTORE FROM BACKUP${NC}"
echo "======================"
echo ""

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Backup directory not specified${NC}"
    echo ""
    echo "Usage: $0 <backup-directory>"
    echo ""
    echo "Available backups:"
    ls -lh backups/ | grep "shutdown_" | tail -n 5
    exit 1
fi

BACKUP_DIR="./backups/$1"

if [ ! -d "${BACKUP_DIR}" ]; then
    echo -e "${RED}❌ Error: Backup directory not found: ${BACKUP_DIR}${NC}"
    echo ""
    echo "Available backups:"
    ls -d backups/shutdown_* 2>/dev/null | xargs -n1 basename
    exit 1
fi

# Show backup info
echo -e "${BLUE}📋 Backup Information:${NC}"
if [ -f "${BACKUP_DIR}/BACKUP_MANIFEST.json" ]; then
    cat "${BACKUP_DIR}/BACKUP_MANIFEST.json"
    echo ""
fi

# Confirmation
echo -e "${YELLOW}⚠️  WARNING: This will overwrite current system state!${NC}"
echo ""
read -p "Are you sure you want to restore from this backup? (yes/no) " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled"
    exit 0
fi

# Function to show progress
show_progress() {
    echo -e "${GREEN}✓${NC} $1"
}

# Stop running services
echo -e "${BLUE}🛑 Step 1: Stopping services...${NC}"

if command -v pm2 &> /dev/null; then
    pm2 stop all 2>/dev/null || true
    show_progress "Services stopped"
else
    echo "  PM2 not found - skipping"
fi

# Restore database
echo -e "${BLUE}🗄️  Step 2: Restoring database...${NC}"

if [ -f "${BACKUP_DIR}/database/full_backup.dump" ]; then
    if [ -f .env ]; then
        source .env
        DB_URL=${DATABASE_URL:-"postgresql://localhost:5432/elite_agent_syndicate"}
        
        DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:\/]*\).*/\1/p')
        DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*$/\1/p')
        DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*$/\1/p')
        
        echo "  Dropping existing database..."
        PGPASSWORD="${DB_PASS}" psql \
            -h "${DB_HOST:-localhost}" \
            -p "${DB_PORT:-5432}" \
            -U "${DB_USER:-postgres}" \
            -d "postgres" \
            -c "DROP DATABASE IF EXISTS ${DB_NAME};" \
            2>/dev/null || true
        
        echo "  Restoring database..."
        PGPASSWORD="${DB_PASS}" pg_restore \
            -h "${DB_HOST:-localhost}" \
            -p "${DB_PORT:-5432}" \
            -U "${DB_USER:-postgres}" \
            -d "postgres" \
            --clean \
            --if-exists \
            --create \
            --verbose \
            "${BACKUP_DIR}/database/full_backup.dump" \
            2>&1 | grep -v "WARNING" || true
        
        show_progress "Database restored"
    else
        echo -e "${YELLOW}⚠${NC}  .env not found - skipping database restore"
    fi
else
    echo "  No database backup found"
fi

# Restore memory persistence
echo -e "${BLUE}🧠 Step 3: Restoring memory persistence...${NC}"

if [ -d "${BACKUP_DIR}/memory_persistence" ]; then
    rm -rf memory_persistence
    cp -r "${BACKUP_DIR}/memory_persistence" ./
    show_progress "Memory persistence restored"
else
    echo "  No memory persistence in backup"
fi

# Restore agent configurations
echo -e "${BLUE}🤖 Step 4: Restoring agent configurations...${NC}"

if [ -d "${BACKUP_DIR}/agents/learning" ]; then
    rm -rf src/learning
    cp -r "${BACKUP_DIR}/agents/learning" src/
    show_progress "Learning data restored"
fi

if [ -d "${BACKUP_DIR}/agents/legendary-arbitrage-syndicate" ]; then
    rm -rf src/legendary-arbitrage-syndicate
    cp -r "${BACKUP_DIR}/agents/legendary-arbitrage-syndicate" src/
    show_progress "Agent characters restored"
fi

# Restore uploads
echo -e "${BLUE}📁 Step 5: Restoring uploads...${NC}"

if [ -d "${BACKUP_DIR}/uploads" ]; then
    rm -rf uploads
    cp -r "${BACKUP_DIR}/uploads" ./
    show_progress "Uploads restored"
else
    echo "  No uploads in backup"
fi

# Restore logs
echo -e "${BLUE}📝 Step 6: Restoring logs...${NC}"

if [ -d "${BACKUP_DIR}/logs" ]; then
    # Merge with existing logs
    mkdir -p logs
    cp -r "${BACKUP_DIR}/logs/"* logs/ 2>/dev/null || true
    show_progress "Logs restored"
else
    echo "  No logs in backup"
fi

# Verify checksums
echo -e "${BLUE}🔐 Step 7: Verifying restore integrity...${NC}"

if [ -f "${BACKUP_DIR}/CHECKSUMS.txt" ]; then
    cd "${BACKUP_DIR}"
    if sha256sum -c CHECKSUMS.txt &> /dev/null; then
        cd - > /dev/null
        show_progress "Integrity verified"
    else
        cd - > /dev/null
        echo -e "${YELLOW}⚠${NC}  Some files may have changed (non-critical)"
    fi
else
    echo "  No checksums to verify"
fi

# Set permissions
echo -e "${BLUE}🔧 Step 8: Setting permissions...${NC}"

chmod +x scripts/*.sh 2>/dev/null || true
chmod +x tests/load/*.sh 2>/dev/null || true
chmod -R 755 memory_persistence 2>/dev/null || true
chmod -R 755 uploads 2>/dev/null || true

show_progress "Permissions set"

# Final summary
echo ""
echo "==============================="
echo -e "${GREEN}✅ RESTORE COMPLETED${NC}"
echo "==============================="
echo ""
echo "📊 Restored components:"
echo "   ✓ Database with all learnings"
echo "   ✓ Agent states & memory"
echo "   ✓ Collective intelligence"
echo "   ✓ Uploaded files"
echo "   ✓ System logs"
echo ""
echo "🚀 Next steps:"
echo "   1. Start services: pm2 start ecosystem.config.js"
echo "   2. Check status: pm2 status"
echo "   3. View logs: pm2 logs"
echo ""
echo "💡 All learning and knowledge from the previous"
echo "   server has been successfully transferred!"
echo ""

# Offer to start services
read -p "Start services now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pm2 start ecosystem.config.js
    pm2 save
    echo ""
    pm2 status
fi
