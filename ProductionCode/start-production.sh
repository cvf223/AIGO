#!/bin/bash

# 🚀 CONSTRUCTION AI PRODUCTION STARTUP SCRIPT
# ===========================================

echo "🚀 CONSTRUCTION AI - PRODUCTION DEPLOYMENT"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
    echo ""
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Create required directories
echo "📁 Creating directories..."
mkdir -p uploads output logs golden_dataset

# Check if running with Docker
if [ "$1" == "docker" ]; then
    echo "🐳 Starting with Docker Compose..."
    docker-compose up -d
    echo "✅ Services started. Access the API at http://localhost:3000"
    echo "📊 Monitoring available at:"
    echo "   - Prometheus: http://localhost:9090"
    echo "   - Grafana: http://localhost:3001"
else
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        echo "⚠️  PostgreSQL not found. Please install PostgreSQL or use Docker mode."
        echo "   Run: ./start-production.sh docker"
        exit 1
    fi
    
    # Check Redis
    if ! command -v redis-cli &> /dev/null; then
        echo "⚠️  Redis not found. Please install Redis or use Docker mode."
        echo "   Run: ./start-production.sh docker"
        exit 1
    fi
    
    # Start server
    echo "🌟 Starting production server..."
    echo ""
    node src/construction/server.js
fi
