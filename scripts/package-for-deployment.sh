#!/bin/bash

# 📦 DEPLOYMENT PACKAGE CREATOR
# =============================
# Creates a complete deployable package of the Elite Construction AI Syndicate
# Includes: code, database, agent states, learnings, and all configurations
#
# Usage: ./scripts/package-for-deployment.sh [output-name]

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 ELITE CONSTRUCTION AI SYNDICATE - DEPLOYMENT PACKAGER${NC}"
echo "=========================================================="
echo ""

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME=${1:-"elite-construction-syndicate-${TIMESTAMP}"}
TEMP_DIR="/tmp/deployment_package_${TIMESTAMP}"
OUTPUT_DIR="./deployment-packages"
FINAL_PACKAGE="${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz"

# Create directories
mkdir -p "${OUTPUT_DIR}"
mkdir -p "${TEMP_DIR}"

echo -e "${YELLOW}📋 Package Configuration:${NC}"
echo "  Package Name: ${PACKAGE_NAME}"
echo "  Output: ${FINAL_PACKAGE}"
echo "  Temp Directory: ${TEMP_DIR}"
echo ""

# Function to show progress
show_progress() {
    echo -e "${GREEN}✓${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

show_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Copy codebase (exclude node_modules, logs, temp files)
echo -e "${BLUE}📁 Step 1: Copying codebase...${NC}"

rsync -av \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'logs' \
    --exclude 'deployment-packages' \
    --exclude 'temp' \
    --exclude '.DS_Store' \
    --exclude '*.log' \
    --exclude 'uploads/temp' \
    ./ "${TEMP_DIR}/codebase/"

show_progress "Codebase copied"

# 2. Export database
echo -e "${BLUE}🗄️  Step 2: Exporting database...${NC}"

if command -v pg_dump &> /dev/null; then
    # Get database connection details from .env
    if [ -f .env ]; then
        source .env
        DB_URL=${DATABASE_URL:-"postgresql://localhost:5432/elite_agent_syndicate"}
        
        # Parse database URL
        DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:\/]*\).*/\1/p')
        DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*$/\1/p')
        DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*$/\1/p')
        
        echo "  Database: ${DB_NAME}"
        echo "  Host: ${DB_HOST}"
        echo "  Port: ${DB_PORT}"
        
        # Full database dump with structure and data
        PGPASSWORD="${DB_PASS}" pg_dump \
            -h "${DB_HOST:-localhost}" \
            -p "${DB_PORT:-5432}" \
            -U "${DB_USER:-postgres}" \
            -d "${DB_NAME}" \
            --clean \
            --if-exists \
            --create \
            --format=custom \
            --file="${TEMP_DIR}/database/database_backup.dump" \
            2>/dev/null || show_warning "Database export failed - will continue without DB backup"
        
        # Also create SQL format for compatibility
        PGPASSWORD="${DB_PASS}" pg_dump \
            -h "${DB_HOST:-localhost}" \
            -p "${DB_PORT:-5432}" \
            -U "${DB_USER:-postgres}" \
            -d "${DB_NAME}" \
            --clean \
            --if-exists \
            --create \
            --file="${TEMP_DIR}/database/database_backup.sql" \
            2>/dev/null || show_warning "SQL export failed"
        
        show_progress "Database exported (custom + SQL formats)"
    else
        show_warning ".env file not found - skipping database export"
    fi
else
    show_warning "pg_dump not found - skipping database export"
fi

# 3. Save agent states and learnings
echo -e "${BLUE}🤖 Step 3: Saving agent states and learnings...${NC}"

mkdir -p "${TEMP_DIR}/agent_states"

# Save from database if available
if [ -f .env ]; then
    source .env
    DB_URL=${DATABASE_URL:-"postgresql://localhost:5432/elite_agent_syndicate"}
    
    # Export specific tables with agent data
    for table in agents agent_actions collective_learning shared_memory system_metrics; do
        PGPASSWORD="${DB_PASS}" pg_dump \
            -h "${DB_HOST:-localhost}" \
            -p "${DB_PORT:-5432}" \
            -U "${DB_USER:-postgres}" \
            -d "${DB_NAME}" \
            --table="${table}" \
            --data-only \
            --format=custom \
            --file="${TEMP_DIR}/agent_states/${table}.dump" \
            2>/dev/null || show_warning "Failed to export ${table}"
    done
fi

# Copy character files and learning data
if [ -d "src/learning" ]; then
    cp -r src/learning "${TEMP_DIR}/agent_states/"
    show_progress "Learning data copied"
fi

if [ -d "src/legendary-arbitrage-syndicate" ]; then
    cp -r src/legendary-arbitrage-syndicate "${TEMP_DIR}/agent_states/"
    show_progress "Agent character files copied"
fi

# Copy memory persistence files
if [ -d "memory_persistence" ]; then
    cp -r memory_persistence "${TEMP_DIR}/agent_states/"
    show_progress "Memory persistence copied"
fi

# 4. Save uploaded files and generated content
echo -e "${BLUE}📄 Step 4: Saving uploaded files...${NC}"

if [ -d "uploads" ]; then
    mkdir -p "${TEMP_DIR}/uploads"
    rsync -av --exclude 'temp' uploads/ "${TEMP_DIR}/uploads/"
    show_progress "Uploaded files saved"
fi

# 5. Save logs (last 7 days)
echo -e "${BLUE}📝 Step 5: Saving recent logs...${NC}"

if [ -d "logs" ]; then
    mkdir -p "${TEMP_DIR}/logs"
    find logs -type f -mtime -7 -exec cp {} "${TEMP_DIR}/logs/" \;
    show_progress "Recent logs saved"
fi

# 6. Create deployment metadata
echo -e "${BLUE}📋 Step 6: Creating deployment metadata...${NC}"

cat > "${TEMP_DIR}/DEPLOYMENT_INFO.txt" << EOF
Elite Construction AI Syndicate - Deployment Package
===================================================

Package Created: $(date)
Hostname: $(hostname)
Node Version: $(node --version)
Platform: $(uname -s)
Architecture: $(uname -m)

Package Contents:
- Complete codebase (excluding node_modules)
- Full database dump (custom + SQL formats)
- All agent states and learnings
- Shared memory and collective learning
- Uploaded files and generated content
- Recent logs (last 7 days)

Deployment Instructions:
1. Extract package: tar -xzf ${PACKAGE_NAME}.tar.gz
2. Run deployment script: cd ${PACKAGE_NAME} && ./deploy.sh
3. Follow on-screen instructions

System Requirements:
- Node.js 18+
- PostgreSQL 14+
- 16GB+ RAM (recommended: 896GB)
- pnpm package manager

For support or questions, refer to PRODUCTION_DEPLOYMENT_SUMMARY.md
EOF

show_progress "Deployment metadata created"

# 7. Copy deployment scripts
echo -e "${BLUE}🚀 Step 7: Including deployment scripts...${NC}"

# Copy the unpack and deploy script
cp scripts/deploy-from-package.sh "${TEMP_DIR}/deploy.sh" 2>/dev/null || \
    echo "#!/bin/bash
echo 'Run: cd codebase && pnpm install && pm2 start ecosystem.config.js'
" > "${TEMP_DIR}/deploy.sh"

chmod +x "${TEMP_DIR}/deploy.sh"
show_progress "Deployment scripts included"

# 8. Create package manifest
echo -e "${BLUE}📊 Step 8: Creating package manifest...${NC}"

cat > "${TEMP_DIR}/MANIFEST.json" << EOF
{
  "packageName": "${PACKAGE_NAME}",
  "timestamp": "${TIMESTAMP}",
  "version": "1.0.0",
  "contents": {
    "codebase": true,
    "database": $([ -f "${TEMP_DIR}/database/database_backup.dump" ] && echo "true" || echo "false"),
    "agentStates": true,
    "uploads": $([ -d "${TEMP_DIR}/uploads" ] && echo "true" || echo "false"),
    "logs": true
  },
  "size": "calculating...",
  "checksums": {}
}
EOF

show_progress "Manifest created"

# 9. Calculate checksums
echo -e "${BLUE}🔐 Step 9: Calculating checksums...${NC}"

cd "${TEMP_DIR}"
find . -type f -exec sha256sum {} \; > CHECKSUMS.txt
show_progress "Checksums calculated"

# 10. Create compressed archive
echo -e "${BLUE}📦 Step 10: Creating compressed archive...${NC}"

cd /tmp
echo "  Compressing... (this may take a while)"

tar -czf "${FINAL_PACKAGE}" "deployment_package_${TIMESTAMP}/"

PACKAGE_SIZE=$(du -h "${FINAL_PACKAGE}" | cut -f1)
show_progress "Package created: ${PACKAGE_SIZE}"

# 11. Cleanup temp directory
echo -e "${BLUE}🧹 Step 11: Cleaning up...${NC}"

rm -rf "${TEMP_DIR}"
show_progress "Temporary files removed"

# Final summary
echo ""
echo "=========================================================="
echo -e "${GREEN}✅ DEPLOYMENT PACKAGE CREATED SUCCESSFULLY${NC}"
echo "=========================================================="
echo ""
echo "📦 Package: ${FINAL_PACKAGE}"
echo "📊 Size: ${PACKAGE_SIZE}"
echo ""
echo "🚀 Transfer to your server:"
echo "   scp ${FINAL_PACKAGE} user@your-server:/path/to/deployment/"
echo ""
echo "📂 On the server, extract with:"
echo "   tar -xzf ${PACKAGE_NAME}.tar.gz"
echo "   cd ${PACKAGE_NAME}"
echo "   ./deploy.sh"
echo ""
echo "=========================================================="

# Create quick transfer script
cat > "${OUTPUT_DIR}/transfer-${PACKAGE_NAME}.sh" << 'TRANSFER_EOF'
#!/bin/bash
# Quick transfer script
# Edit these variables:
SERVER_USER="your-username"
SERVER_HOST="your-server-ip"
SERVER_PATH="/home/${SERVER_USER}/deployments"

echo "📤 Transferring package to server..."
scp PACKAGE_FILE "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"
echo "✅ Transfer complete!"
echo ""
echo "🔗 SSH to server and deploy:"
echo "   ssh ${SERVER_USER}@${SERVER_HOST}"
echo "   cd ${SERVER_PATH}"
echo "   tar -xzf $(basename PACKAGE_FILE)"
echo "   cd $(basename PACKAGE_FILE .tar.gz)"
echo "   ./deploy.sh"
TRANSFER_EOF

sed -i '' "s|PACKAGE_FILE|${FINAL_PACKAGE}|g" "${OUTPUT_DIR}/transfer-${PACKAGE_NAME}.sh" 2>/dev/null || \
sed -i "s|PACKAGE_FILE|${FINAL_PACKAGE}|g" "${OUTPUT_DIR}/transfer-${PACKAGE_NAME}.sh"

chmod +x "${OUTPUT_DIR}/transfer-${PACKAGE_NAME}.sh"

echo "💡 Quick transfer script created: ${OUTPUT_DIR}/transfer-${PACKAGE_NAME}.sh"
echo ""
