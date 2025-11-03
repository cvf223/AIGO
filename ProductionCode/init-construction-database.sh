#!/bin/bash

# 🏗️ CONSTRUCTION SYNDICATE DATABASE INITIALIZATION
# ================================================
# Initializes PostgreSQL database with construction schemas

echo "🏗️ CONSTRUCTION SYNDICATE DATABASE INITIALIZATION"
echo "================================================"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection parameters
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-construction_syndicate}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"

echo "📊 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
        echo "✅ PostgreSQL is running and accessible"
    else
        echo "❌ Cannot connect to PostgreSQL"
        echo "Please ensure PostgreSQL is running and credentials are correct"
        exit 1
    fi
else
    echo "⚠️ psql command not found. Assuming PostgreSQL is running..."
fi

# Create database if it doesn't exist
echo ""
echo "🗄️ Creating database if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres << EOF
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
EOF

echo "✅ Database '$DB_NAME' ready"

# Run migration script
echo ""
echo "🚀 Running database migrations..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/migrations/create-construction-schemas.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DATABASE INITIALIZATION COMPLETE!"
    echo "================================================"
    echo "📊 Database Tables Created:"
    echo "   - construction_projects"
    echo "   - construction_plans"
    echo "   - plan_cross_references"
    echo "   - extracted_quantities"
    echo "   - bills_of_quantities"
    echo "   - boq_positions"
    echo "   - tender_documents"
    echo "   - contractor_bids"
    echo "   - bid_items"
    echo "   - bid_evaluations"
    echo "   - error_detections"
    echo "   - escalation_tickets"
    echo "   - construction_agent_performance"
    echo "   - hoai_compliance_checks"
    echo "   - construction_activity_log"
    echo ""
    echo "📈 Views Created:"
    echo "   - v_project_overview"
    echo "   - v_bid_evaluation_summary"
    echo "   - v_active_escalations"
    echo ""
    echo "🎉 Construction Syndicate database is ready for use!"
else
    echo ""
    echo "❌ DATABASE INITIALIZATION FAILED"
    echo "Please check the error messages above"
    exit 1
fi

