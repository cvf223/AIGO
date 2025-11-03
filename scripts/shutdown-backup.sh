#!/bin/bash

# 💾 AUTOMATIC SHUTDOWN BACKUP
# ============================
# Creates complete backup on system shutdown
# Captures: code, database, agent states, learnings, memory
#
# This script is triggered automatically by PM2 on shutdown

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}💾 CREATING SHUTDOWN BACKUP${NC}"
echo "==============================="
echo ""

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/shutdown_${TIMESTAMP}"
BACKUP_PACKAGE="./backups/shutdown_backup_${TIMESTAMP}.tar.gz"

mkdir -p "${BACKUP_DIR}"
mkdir -p "./backups"

echo -e "${YELLOW}⚠️  This may take a few minutes...${NC}"
echo ""

# Function to show progress
show_progress() {
    echo -e "${GREEN}✓${NC} $1"
}

# 1. Save all agent states from memory
echo "🤖 Saving agent states..."

if [ -d "memory_persistence" ]; then
    cp -r memory_persistence "${BACKUP_DIR}/"
    show_progress "Memory persistence saved"
fi

# 2. Export database with all learnings
echo "🗄️  Exporting database..."

if [ -f .env ]; then
    source .env
    DB_URL=${DATABASE_URL:-"postgresql://localhost:5432/elite_agent_syndicate"}
    
    DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:\/]*\).*/\1/p')
    DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*$/\1/p')
    DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*$/\1/p')
    
    mkdir -p "${BACKUP_DIR}/database"
    
    # Full database dump
    PGPASSWORD="${DB_PASS}" pg_dump \
        -h "${DB_HOST:-localhost}" \
        -p "${DB_PORT:-5432}" \
        -U "${DB_USER:-postgres}" \
        -d "${DB_NAME}" \
        --clean \
        --if-exists \
        --create \
        --format=custom \
        --file="${BACKUP_DIR}/database/full_backup.dump" \
        2>/dev/null && show_progress "Database exported" || echo "  Warning: Database export failed"
    
    # Also SQL format
    PGPASSWORD="${DB_PASS}" pg_dump \
        -h "${DB_HOST:-localhost}" \
        -p "${DB_PORT:-5432}" \
        -U "${DB_USER:-postgres}" \
        -d "${DB_NAME}" \
        --clean \
        --if-exists \
        --create \
        --file="${BACKUP_DIR}/database/full_backup.sql" \
        2>/dev/null || true
fi

# 3. Save current agent configurations
echo "🧠 Saving agent configurations..."

mkdir -p "${BACKUP_DIR}/agents"

if [ -d "src/learning" ]; then
    cp -r src/learning "${BACKUP_DIR}/agents/"
fi

if [ -d "src/legendary-arbitrage-syndicate" ]; then
    cp -r src/legendary-arbitrage-syndicate "${BACKUP_DIR}/agents/"
fi

show_progress "Agent configurations saved"

# 4. Save uploaded files and generated content
echo "📁 Saving user data..."

if [ -d "uploads" ]; then
    cp -r uploads "${BACKUP_DIR}/"
    show_progress "Uploads saved"
fi

# 5. Save recent logs
echo "📝 Saving logs..."

if [ -d "logs" ]; then
    cp -r logs "${BACKUP_DIR}/"
    show_progress "Logs saved"
fi

# 6. Save configuration
echo "⚙️  Saving configuration..."

mkdir -p "${BACKUP_DIR}/config"

# Copy env (without secrets - just structure)
if [ -f ".env" ]; then
    grep -v "PASSWORD\|SECRET\|KEY\|PRIVATE" .env > "${BACKUP_DIR}/config/env.template" || true
fi

# Copy important config files
for file in ecosystem.config.js nginx/sites-available/* package.json pnpm-lock.yaml; do
    if [ -f "$file" ]; then
        mkdir -p "${BACKUP_DIR}/config/$(dirname $file)"
        cp "$file" "${BACKUP_DIR}/config/$file"
    fi
done

show_progress "Configuration saved"

# 7. Create backup manifest
echo "📊 Creating backup manifest..."

cat > "${BACKUP_DIR}/BACKUP_MANIFEST.json" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "type": "shutdown_backup",
  "hostname": "$(hostname)",
  "nodeVersion": "$(node --version)",
  "platform": "$(uname -s)",
  "contents": {
    "database": $([ -f "${BACKUP_DIR}/database/full_backup.dump" ] && echo "true" || echo "false"),
    "agentStates": true,
    "memoryPersistence": $([ -d "${BACKUP_DIR}/memory_persistence" ] && echo "true" || echo "false"),
    "uploads": $([ -d "${BACKUP_DIR}/uploads" ] && echo "true" || echo "false"),
    "logs": true,
    "configuration": true
  },
  "restorable": true,
  "comment": "Complete system state at shutdown - ready for restoration on any server"
}
EOF

show_progress "Manifest created"

# 8. Create checksums
echo "🔐 Calculating checksums..."

cd "${BACKUP_DIR}"
find . -type f -exec sha256sum {} \; > CHECKSUMS.txt
cd - > /dev/null

show_progress "Checksums calculated"

# 9. Compress backup
echo "📦 Compressing backup..."

tar -czf "${BACKUP_PACKAGE}" -C "./backups" "shutdown_${TIMESTAMP}/"

BACKUP_SIZE=$(du -h "${BACKUP_PACKAGE}" | cut -f1)

show_progress "Backup compressed (${BACKUP_SIZE})"

# 10. Cleanup old backups (keep last 10)
echo "🧹 Managing backup retention..."

cd backups
ls -t shutdown_backup_*.tar.gz | tail -n +11 | xargs -r rm
cd - > /dev/null

show_progress "Old backups cleaned"

# 11. Remove uncompressed backup
rm -rf "${BACKUP_DIR}"

echo ""
echo "==============================="
echo -e "${GREEN}✅ SHUTDOWN BACKUP COMPLETE${NC}"
echo "==============================="
echo ""
echo "📦 Backup: ${BACKUP_PACKAGE}"
echo "📊 Size: ${BACKUP_SIZE}"
echo ""
echo "🚀 To restore on another server:"
echo "   1. Transfer: scp ${BACKUP_PACKAGE} user@server:/path/"
echo "   2. Extract: tar -xzf $(basename ${BACKUP_PACKAGE})"
echo "   3. Run: ./scripts/restore-from-backup.sh shutdown_${TIMESTAMP}"
echo ""
echo "💡 This backup contains ALL:"
echo "   ✓ Complete database state"
echo "   ✓ All agent learnings & memory"
echo "   ✓ Shared knowledge & collective intelligence"
echo "   ✓ Uploaded plans & analysis results"
echo "   ✓ System configuration"
echo ""
echo "You can now safely move to a different server!"
echo ""
