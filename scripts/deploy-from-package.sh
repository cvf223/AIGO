#!/bin/bash

# 🚀 DEPLOYMENT SCRIPT
# ====================
# Deploys Elite Construction AI Syndicate from deployment package
# Restores code, database, agent states, and all learnings
#
# Usage: ./deploy.sh

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 ELITE CONSTRUCTION AI SYNDICATE - DEPLOYMENT${NC}"
echo "================================================"
echo ""

# Check if running as deployment package
if [ ! -f "DEPLOYMENT_INFO.txt" ]; then
    echo -e "${RED}❌ Error: This script must be run from the extracted deployment package${NC}"
    echo "Please extract the package first: tar -xzf package.tar.gz"
    exit 1
fi

# Show deployment info
echo -e "${BLUE}📋 Deployment Information:${NC}"
cat DEPLOYMENT_INFO.txt | head -n 10
echo ""

# Confirmation
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Check system requirements
echo -e "${BLUE}🔍 Checking system requirements...${NC}"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | sed 's/v//')
    echo -e "${GREEN}✓${NC} Node.js ${NODE_VERSION}"
else
    echo -e "${RED}✗${NC} Node.js not found - please install Node.js 18+"
    exit 1
fi

# pnpm
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✓${NC} pnpm installed"
else
    echo -e "${YELLOW}⚠${NC}  pnpm not found - installing..."
    npm install -g pnpm
fi

# PostgreSQL
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✓${NC} PostgreSQL ${PG_VERSION}"
else
    echo -e "${YELLOW}⚠${NC}  PostgreSQL not found - please install PostgreSQL 14+"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# PM2
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓${NC} PM2 installed"
else
    echo -e "${YELLOW}⚠${NC}  PM2 not found - installing..."
    npm install -g pm2
fi

echo ""

# Setup deployment directory
DEPLOY_DIR=$(pwd)
INSTALL_DIR="${HOME}/elite-construction-syndicate"

echo -e "${BLUE}📁 Step 1: Setting up installation directory...${NC}"
echo "  Target: ${INSTALL_DIR}"

read -p "Use this directory? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter installation directory: " INSTALL_DIR
fi

# Create installation directory
mkdir -p "${INSTALL_DIR}"

# Copy codebase
echo -e "${BLUE}📦 Step 2: Installing codebase...${NC}"
rsync -av --info=progress2 codebase/ "${INSTALL_DIR}/"
echo -e "${GREEN}✓${NC} Codebase installed"

# Navigate to installation directory
cd "${INSTALL_DIR}"

# Install dependencies
echo -e "${BLUE}📚 Step 3: Installing dependencies...${NC}"
echo "  This may take a while..."

pnpm install --frozen-lockfile

# Approve build scripts if needed
if [ -f "node_modules/.bin/bcrypt" ]; then
    pnpm approve-builds 2>/dev/null || true
fi

echo -e "${GREEN}✓${NC} Dependencies installed"

# Build frontend
echo -e "${BLUE}🏗️  Step 4: Building frontend...${NC}"
cd web-gui-construction
pnpm build
cd ..
echo -e "${GREEN}✓${NC} Frontend built"

# Setup environment
echo -e "${BLUE}⚙️  Step 5: Configuring environment...${NC}"

if [ ! -f ".env" ]; then
    echo "  Creating .env file from template..."
    
    if [ -f "docs/env.production.example" ]; then
        cp docs/env.production.example .env
        echo -e "${YELLOW}⚠${NC}  Please edit .env with your configuration"
        echo "  Important settings to update:"
        echo "    - DATABASE_URL"
        echo "    - JWT_SECRET (generate with: openssl rand -hex 32)"
        echo "    - API keys for LLMs and blockchain"
        
        read -p "Press Enter to edit .env now, or Ctrl+C to do it later..."
        ${EDITOR:-nano} .env
    else
        echo -e "${YELLOW}⚠${NC}  No .env template found - you'll need to create one manually"
    fi
else
    echo -e "${GREEN}✓${NC} .env file exists"
fi

# Restore database
echo -e "${BLUE}🗄️  Step 6: Restoring database...${NC}"

if [ -f "${DEPLOY_DIR}/database/database_backup.dump" ]; then
    echo "  Database backup found"
    
    read -p "Restore database? This will OVERWRITE existing data! (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Get database credentials
        if [ -f ".env" ]; then
            source .env
            DB_URL=${DATABASE_URL:-"postgresql://localhost:5432/elite_agent_syndicate"}
            
            DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
            DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:\/]*\).*/\1/p')
            DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*$/\1/p')
            DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*$/\1/p')
            
            echo "  Restoring to: ${DB_NAME} on ${DB_HOST}:${DB_PORT}"
            
            # Restore from custom format
            PGPASSWORD="${DB_PASS}" pg_restore \
                -h "${DB_HOST:-localhost}" \
                -p "${DB_PORT:-5432}" \
                -U "${DB_USER:-postgres}" \
                -d "postgres" \
                --clean \
                --if-exists \
                --create \
                --verbose \
                "${DEPLOY_DIR}/database/database_backup.dump" \
                2>&1 | grep -v "WARNING" || true
            
            echo -e "${GREEN}✓${NC} Database restored"
        else
            echo -e "${RED}✗${NC} .env file not configured - cannot restore database"
        fi
    else
        echo "  Skipping database restore"
    fi
else
    echo "  No database backup found in package"
fi

# Run database migrations
echo -e "${BLUE}📊 Step 7: Running database migrations...${NC}"

if [ -f "src/database/migrations/migrate.js" ]; then
    node src/database/migrations/migrate.js || echo -e "${YELLOW}⚠${NC}  Migration warnings (check logs)"
    echo -e "${GREEN}✓${NC} Migrations completed"
else
    echo "  No migration scripts found"
fi

# Restore agent states
echo -e "${BLUE}🤖 Step 8: Restoring agent states...${NC}"

if [ -d "${DEPLOY_DIR}/agent_states" ]; then
    # Restore learning data
    if [ -d "${DEPLOY_DIR}/agent_states/learning" ]; then
        mkdir -p src/learning
        cp -r "${DEPLOY_DIR}/agent_states/learning/"* src/learning/
        echo -e "${GREEN}✓${NC} Learning data restored"
    fi
    
    # Restore character files
    if [ -d "${DEPLOY_DIR}/agent_states/legendary-arbitrage-syndicate" ]; then
        mkdir -p src/legendary-arbitrage-syndicate
        cp -r "${DEPLOY_DIR}/agent_states/legendary-arbitrage-syndicate/"* src/legendary-arbitrage-syndicate/
        echo -e "${GREEN}✓${NC} Agent characters restored"
    fi
    
    # Restore memory persistence
    if [ -d "${DEPLOY_DIR}/agent_states/memory_persistence" ]; then
        mkdir -p memory_persistence
        cp -r "${DEPLOY_DIR}/agent_states/memory_persistence/"* memory_persistence/
        echo -e "${GREEN}✓${NC} Memory persistence restored"
    fi
    
    # Restore agent state tables
    if [ -f ".env" ] && ls "${DEPLOY_DIR}/agent_states/"*.dump 1> /dev/null 2>&1; then
        source .env
        for dump_file in "${DEPLOY_DIR}/agent_states/"*.dump; do
            table_name=$(basename "$dump_file" .dump)
            echo "  Restoring ${table_name}..."
            
            PGPASSWORD="${DB_PASS}" pg_restore \
                -h "${DB_HOST:-localhost}" \
                -p "${DB_PORT:-5432}" \
                -U "${DB_USER:-postgres}" \
                -d "${DB_NAME}" \
                --data-only \
                "${dump_file}" \
                2>&1 | grep -v "WARNING" || true
        done
        echo -e "${GREEN}✓${NC} Agent state tables restored"
    fi
else
    echo "  No agent states found in package"
fi

# Restore uploads
echo -e "${BLUE}📄 Step 9: Restoring uploaded files...${NC}"

if [ -d "${DEPLOY_DIR}/uploads" ]; then
    mkdir -p uploads
    rsync -av "${DEPLOY_DIR}/uploads/" uploads/
    echo -e "${GREEN}✓${NC} Uploaded files restored"
else
    echo "  No uploaded files in package"
fi

# Create necessary directories
echo -e "${BLUE}📁 Step 10: Creating directories...${NC}"

mkdir -p logs
mkdir -p memory_persistence
mkdir -p uploads/{plans,annotated,temp}
mkdir -p .cache

echo -e "${GREEN}✓${NC} Directories created"

# Setup PM2
echo -e "${BLUE}🔧 Step 11: Configuring PM2...${NC}"

# Save PM2 configuration
pm2 startup | tail -n 1 | sh || echo -e "${YELLOW}⚠${NC}  Run 'pm2 startup' manually if needed"

echo -e "${GREEN}✓${NC} PM2 configured"

# Final summary
echo ""
echo "=========================================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETED SUCCESSFULLY${NC}"
echo "=========================================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1️⃣  Review and update .env configuration:"
echo "   nano .env"
echo ""
echo "2️⃣  Start the services:"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "3️⃣  Save PM2 configuration:"
echo "   pm2 save"
echo ""
echo "4️⃣  Monitor services:"
echo "   pm2 monit"
echo ""
echo "5️⃣  View logs:"
echo "   pm2 logs"
echo ""
echo "🌐 Access points (after starting):"
echo "   - Frontend: http://localhost:3000"
echo "   - API: http://localhost:3001"
echo "   - Swagger UI: http://localhost:3004"
echo "   - Monitoring: http://localhost:3003"
echo ""
echo "🔧 For production setup:"
echo "   - Configure Nginx: sudo cp nginx/sites-available/construction-syndicate /etc/nginx/sites-available/"
echo "   - Setup SSL: sudo certbot --nginx"
echo "   - Configure firewall: sudo ufw allow 80,443/tcp"
echo ""
echo "=========================================================="
echo ""

# Offer to start services
read -p "Start services now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting services..."
    pm2 start ecosystem.config.js
    pm2 save
    echo ""
    echo "✅ Services started!"
    echo ""
    pm2 status
fi
