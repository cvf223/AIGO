#!/bin/bash

##
# 🏗️ VERIFY CONSTRUCTION SYNDICATE GUI INSTALLATION
# ==================================================
# 
# Checks that all components are properly installed and configured
##

echo "🏗️ CONSTRUCTION SYNDICATE GUI - INSTALLATION VERIFICATION"
echo "==========================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track status
ALL_GOOD=true

# 1. Check web-gui-construction directory exists
echo "📁 Checking web-gui-construction directory..."
if [ -d "web-gui-construction" ]; then
    echo -e "${GREEN}✅ Directory exists${NC}"
else
    echo -e "${RED}❌ Directory not found${NC}"
    ALL_GOOD=false
fi

# 2. Check package.json exists
echo "📦 Checking package.json..."
if [ -f "web-gui-construction/package.json" ]; then
    echo -e "${GREEN}✅ package.json exists${NC}"
else
    echo -e "${RED}❌ package.json not found${NC}"
    ALL_GOOD=false
fi

# 3. Check node_modules exists
echo "📚 Checking node_modules..."
if [ -d "web-gui-construction/node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found - run: cd web-gui-construction && pnpm install${NC}"
    ALL_GOOD=false
fi

# 4. Check pnpm workspace configuration
echo "🔧 Checking pnpm workspace..."
if grep -q "web-gui-construction" pnpm-workspace.yaml; then
    echo -e "${GREEN}✅ Added to pnpm workspace${NC}"
else
    echo -e "${RED}❌ Not in pnpm workspace${NC}"
    ALL_GOOD=false
fi

# 5. Check backend files exist
echo "🔌 Checking backend files..."
if [ -f "src/web/construction-gui-server.js" ]; then
    echo -e "${GREEN}✅ construction-gui-server.js exists${NC}"
else
    echo -e "${RED}❌ construction-gui-server.js not found${NC}"
    ALL_GOOD=false
fi

if [ -f "src/web/SystemMonitoringCollector.js" ]; then
    echo -e "${GREEN}✅ SystemMonitoringCollector.js exists${NC}"
else
    echo -e "${RED}❌ SystemMonitoringCollector.js not found${NC}"
    ALL_GOOD=false
fi

# 6. Check Next.js config
echo "⚙️  Checking Next.js configuration..."
if [ -f "web-gui-construction/next.config.js" ]; then
    echo -e "${GREEN}✅ next.config.js exists${NC}"
else
    echo -e "${RED}❌ next.config.js not found${NC}"
    ALL_GOOD=false
fi

# 7. Check TailwindCSS config
echo "🎨 Checking TailwindCSS configuration..."
if [ -f "web-gui-construction/tailwind.config.js" ]; then
    echo -e "${GREEN}✅ tailwind.config.js exists${NC}"
else
    echo -e "${RED}❌ tailwind.config.js not found${NC}"
    ALL_GOOD=false
fi

# 8. Check pages exist
echo "📄 Checking pages..."
PAGES=("index.jsx" "chat.jsx" "systems.jsx" "mailbox.jsx" "notifications.jsx" "plans.jsx" "projects.jsx" "settings.jsx")
PAGES_OK=true

for page in "${PAGES[@]}"; do
    if [ -f "web-gui-construction/src/pages/$page" ]; then
        echo -e "   ${GREEN}✓${NC} $page"
    else
        echo -e "   ${RED}✗${NC} $page"
        PAGES_OK=false
        ALL_GOOD=false
    fi
done

if [ "$PAGES_OK" = true ]; then
    echo -e "${GREEN}✅ All 8 pages created${NC}"
fi

# 9. Check components exist
echo "🧩 Checking components..."
COMPONENT_DIRS=("chat" "monitoring" "humanloop" "shared")
COMPONENTS_OK=true

for dir in "${COMPONENT_DIRS[@]}"; do
    if [ -d "web-gui-construction/src/components/$dir" ]; then
        COUNT=$(find "web-gui-construction/src/components/$dir" -name "*.jsx" | wc -l | xargs)
        echo -e "   ${GREEN}✓${NC} $dir ($COUNT components)"
    else
        echo -e "   ${RED}✗${NC} $dir"
        COMPONENTS_OK=false
        ALL_GOOD=false
    fi
done

if [ "$COMPONENTS_OK" = true ]; then
    echo -e "${GREEN}✅ All component directories created${NC}"
fi

# 10. Check if Next.js is accessible
echo "🌐 Checking Next.js server..."
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js server running on http://localhost:3002${NC}"
else
    echo -e "${YELLOW}⚠️  Next.js server not running (start with: cd web-gui-construction && pnpm dev)${NC}"
fi

# 11. Check if backend API is accessible
echo "🔌 Checking backend API..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API running on http://localhost:3001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API not running (start with: node startfullsyndicate.js)${NC}"
fi

echo ""
echo "==========================================================="

if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED - GUI IS READY!${NC}"
    echo ""
    echo "🚀 READY TO USE:"
    echo "   Frontend: http://localhost:3002"
    echo "   Backend:  http://localhost:3001"
    echo ""
    echo "📖 Documentation:"
    echo "   Quick Start: START_CONSTRUCTION_GUI.md"
    echo "   Setup Guide: web-gui-construction/SETUP_GUIDE.md"
    echo "   Architecture: web-gui-construction/ARCHITECTURE.md"
else
    echo -e "${RED}❌ SOME CHECKS FAILED - REVIEW ABOVE${NC}"
    echo ""
    echo "💡 To fix installation issues, run:"
    echo "   cd web-gui-construction && pnpm install"
fi

echo ""
echo "==========================================================="

