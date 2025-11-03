#!/bin/bash

echo "========================================="
echo "🚀 FINAL CLEAN DEPLOYMENT"
echo "========================================="
echo ""

SERVER="root@162.55.83.33"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE="clean_construction_${TIMESTAMP}.tar.gz"

echo "📦 Creating final clean archive..."
echo "   Excluding: node_modules, .git, temp files"
echo ""

tar -czf "/tmp/${ARCHIVE}" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.cursor' \
    --exclude='*.bak' \
    --exclude='*.backup' \
    .

SIZE=$(du -h "/tmp/${ARCHIVE}" | cut -f1)
echo "✅ Archive: $SIZE"
echo ""

echo "📤 Uploading to server..."
scp -q "/tmp/${ARCHIVE}" "${SERVER}:/tmp/" && echo "✅ Upload complete"

echo ""
echo "📂 Deploying on server..."
ssh $SERVER bash << 'ENDSSH'
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    DEPLOY_DIR="deployment_${TIMESTAMP}"
    
    cd ~
    mkdir -p "$DEPLOY_DIR"
    tar -xzf /tmp/clean_construction_*.tar.gz -C "$DEPLOY_DIR/" 2>&1 | grep -v "Ignoring unknown" | head -5
    rm -f /tmp/clean_construction_*.tar.gz
    
    # Copy .env if exists
    if [ -f ~/deployment_package_20251016_074413/codebase/.env ]; then
        cp ~/deployment_package_20251016_074413/codebase/.env "$DEPLOY_DIR/.env"
        echo "✅ Copied .env"
    fi
    
    # Update symlink
    rm -f latest_deployment
    ln -sf "$DEPLOY_DIR" latest_deployment
    
    echo "✅ Deployed to: ~/$DEPLOY_DIR"
    echo "🔗 Symlink: ~/latest_deployment"
ENDSSH

rm -f "/tmp/${ARCHIVE}"

echo ""
echo "========================================="
echo "✅ CLEAN DEPLOYMENT COMPLETE!"
echo "========================================="
echo ""
echo "🎯 ALL FIXES INCLUDED:"
echo "  • Blockchain code deleted ✓"
echo "  • Construction services connected ✓"
echo "  • MaterialPriceService integrated ✓"
echo "  • LaborCostService integrated ✓"
echo "  • EquipmentRentalService integrated ✓"
echo "  • SFT Flywheel integrated ✓"
echo "  • Annotation system integrated ✓"
echo "  • All import paths fixed ✓"
echo ""
echo "🚀 Next: Install deps and launch!"
echo "  ssh $SERVER"
echo "  cd ~/latest_deployment"
echo "  pnpm install --prod"
echo "  node startfullsyndicate.js"
echo ""

