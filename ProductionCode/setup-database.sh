#!/bin/bash

# 🗄️ CONSTRUCTION SYNDICATE DATABASE SETUP SCRIPT
# ==============================================
# 
# Sets up the AIGO_Construction_Syndicate PostgreSQL database
# 
# Usage: ./setup-database.sh

echo "🗄️ CONSTRUCTION SYNDICATE DATABASE SETUP"
echo "========================================"
echo ""

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo "   Install: sudo apt-get install postgresql"
    exit 1
fi

echo "🔍 Checking PostgreSQL status..."
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL is running"
else
    echo "⚠️ PostgreSQL is not running"
    echo "   Starting: sudo systemctl start postgresql"
    sudo systemctl start postgresql
fi

echo ""
echo "🗄️ Creating AIGO_Construction_Syndicate database..."

# Run initialization script
psql -U postgres -f database/init-construction-syndicate-db.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DATABASE SETUP COMPLETE"
    echo ""
    echo "Database Details:"
    echo "  Name: AIGO_Construction_Syndicate"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  User: postgres"
    echo ""
    echo "📋 Tables created:"
    psql -U postgres -d AIGO_Construction_Syndicate -c "\dt" | head -20
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Verify connection: psql -U postgres -d AIGO_Construction_Syndicate"
    echo "2. Run Construction Syndicate: node startfullsyndicate.js"
else
    echo ""
    echo "❌ DATABASE SETUP FAILED"
    echo "   Check error messages above"
    echo "   Ensure PostgreSQL is running and postgres user has permissions"
fi

