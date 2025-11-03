#!/bin/bash

# 💾 MANUAL BACKUP SCRIPT
# =======================
# Creates an immediate backup without stopping services
# Useful for scheduled backups or before major changes
#
# Usage: ./scripts/manual-backup.sh [backup-name]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}💾 MANUAL BACKUP${NC}"
echo "================"
echo ""

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME=${1:-"manual_${TIMESTAMP}"}
BACKUP_DIR="./backups/${BACKUP_NAME}"
BACKUP_PACKAGE="./backups/${BACKUP_NAME}.tar.gz"

mkdir -p "${BACKUP_DIR}"
mkdir -p "./backups"

echo "📦 Creating backup: ${BACKUP_NAME}"
echo "   Location: ${BACKUP_PACKAGE}"
echo ""

# Function to show progress
show_progress() {
    echo -e "${GREEN}✓${NC} $1"
}

# 1. Save current state
echo "🧠 Capturing current state..."

if [ -d "memory_persistence" ]; then
    cp -r memory_persistence "${BACKUP_DIR}/" 2>/dev/null || true
fi

if [ -d "src/learning" ]; then
    mkdir -p "${BACKUP_DIR}/agents"
    cp -r src/learning "${BACKUP_DIR}/agents/" 2>/dev/null || true
fi

if [ -d "src/legendary-arbitrage-syndicate" ]; then
    mkdir -p "${BACKUP_DIR}/agents"
    cp -r src/legendary-arbitrage-syndicate "${BACKUP_DIR}/agents/" 2>/dev/null || true
fi

show_progress "Agent states saved"

# 2. Export database
echo "🗄️  Exporting database..."

if [ -f .env ]; then
    source .env
    DB_URL=${DATABASE_URL:-"postgresql://localhost:5432/elite_agent_syndicate"}
    
    DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:\/]*\).*/\1/p')
    DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*$/\1/p')
    DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*$/\1/p')
    
    mkdir -p "${BACKUP_DIR}/database"
    
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
fi

# 3. Save uploads
echo "📁 Saving uploads..."

if [ -d "uploads" ]; then
    cp -r uploads "${BACKUP_DIR}/" 2>/dev/null || true
    show_progress "Uploads saved"
fi

# 4. Create manifest
cat > "${BACKUP_DIR}/BACKUP_MANIFEST.json" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "type": "manual_backup",
  "name": "${BACKUP_NAME}",
  "hostname": "$(hostname)",
  "nodeVersion": "$(node --version)",
  "platform": "$(uname -s)",
  "contents": {
    "database": $([ -f "${BACKUP_DIR}/database/full_backup.dump" ] && echo "true" || echo "false"),
    "agentStates": true,
    "memoryPersistence": $([ -d "${BACKUP_DIR}/memory_persistence" ] && echo "true" || echo "false"),
    "uploads": $([ -d "${BACKUP_DIR}/uploads" ] && echo "true" || echo "false")
  },
  "restorable": true
}
EOF

# 5. Compress
echo "📦 Compressing..."

tar -czf "${BACKUP_PACKAGE}" -C "./backups" "${BACKUP_NAME}/"

BACKUP_SIZE=$(du -h "${BACKUP_PACKAGE}" | cut -f1)

# 6. Cleanup
rm -rf "${BACKUP_DIR}"

echo ""
echo "================"
echo -e "${GREEN}✅ BACKUP COMPLETE${NC}"
echo "================"
echo ""
echo "📦 ${BACKUP_PACKAGE}"
echo "📊 ${BACKUP_SIZE}"
echo ""
echo "🔄 To restore: ./scripts/restore-from-backup.sh ${BACKUP_NAME}"
echo ""
