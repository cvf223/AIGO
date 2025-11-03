#!/bin/bash

# 🔧 INSTALL VLM DEPENDENCIES
# ===========================
# Script to install all required dependencies for VLM Sequential Legend Analyzer
# Author: Elite Construction AI Syndicate
# Version: 1.0.0

echo "═══════════════════════════════════════════════════════════"
echo "🔧 Installing VLM Sequential Legend Analyzer Dependencies"
echo "═══════════════════════════════════════════════════════════"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install npm package
install_npm_package() {
    local package=$1
    echo "📦 Installing $package..."
    npm install $package
    if [ $? -eq 0 ]; then
        echo "   ✅ $package installed successfully"
    else
        echo "   ❌ Failed to install $package"
        exit 1
    fi
}

# Check for Node.js
echo ""
echo "🔍 Checking prerequisites..."
if command_exists node; then
    echo "   ✅ Node.js found: $(node --version)"
else
    echo "   ❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check for npm
if command_exists npm; then
    echo "   ✅ npm found: $(npm --version)"
else
    echo "   ❌ npm not found. Please install npm first."
    exit 1
fi

# Check for Ollama
echo ""
echo "🤖 Checking for Ollama..."
if command_exists ollama; then
    echo "   ✅ Ollama found"
    
    # Check if llava:34b model is available
    echo "   🔍 Checking for llava:34b model..."
    if ollama list | grep -q "llava:34b"; then
        echo "   ✅ llava:34b model found"
    else
        echo "   ⚠️ llava:34b model not found"
        echo "   📥 Pulling llava:34b model (this may take a while)..."
        ollama pull llava:34b
        if [ $? -eq 0 ]; then
            echo "   ✅ llava:34b model installed successfully"
        else
            echo "   ❌ Failed to pull llava:34b model"
            echo "   Please run: ollama pull llava:34b"
            exit 1
        fi
    fi
else
    echo "   ❌ Ollama not found. Please install Ollama first."
    echo "   Visit: https://ollama.ai"
    exit 1
fi

# Install npm dependencies
echo ""
echo "📦 Installing npm dependencies..."
cd "$(dirname "$0")"

# Core dependencies
install_npm_package "ollama"
install_npm_package "canvas"
install_npm_package "tesseract.js"

# Image processing
install_npm_package "sharp"
install_npm_package "pdf2pic"
install_npm_package "pdfjs-dist"

# Additional utilities
install_npm_package "@tensorflow/tfjs-node"
install_npm_package "jimp"

# Create necessary directories
echo ""
echo "📁 Creating necessary directories..."
mkdir -p vlm_analysis_output
mkdir -p test_plan_images
mkdir -p temp_plan_images
echo "   ✅ Directories created"

# Check for system dependencies
echo ""
echo "🔍 Checking system dependencies..."

# Check for ImageMagick (optional but recommended)
if command_exists convert; then
    echo "   ✅ ImageMagick found"
else
    echo "   ⚠️ ImageMagick not found (optional)"
    echo "   For better PDF processing, install ImageMagick:"
    echo "   Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   macOS: brew install imagemagick"
    echo "   CentOS/RHEL: sudo yum install ImageMagick"
fi

# Check for Ghostscript (optional but recommended)
if command_exists gs; then
    echo "   ✅ Ghostscript found"
else
    echo "   ⚠️ Ghostscript not found (optional)"
    echo "   For better PDF processing, install Ghostscript:"
    echo "   Ubuntu/Debian: sudo apt-get install ghostscript"
    echo "   macOS: brew install ghostscript"
    echo "   CentOS/RHEL: sudo yum install ghostscript"
fi

# Check for pdftoppm (optional but recommended)
if command_exists pdftoppm; then
    echo "   ✅ pdftoppm found"
else
    echo "   ⚠️ pdftoppm not found (optional)"
    echo "   For better PDF processing, install poppler-utils:"
    echo "   Ubuntu/Debian: sudo apt-get install poppler-utils"
    echo "   macOS: brew install poppler"
    echo "   CentOS/RHEL: sudo yum install poppler-utils"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ VLM Dependencies Installation Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 Next steps:"
echo "   1. Place your construction plan PNG files in: test_plan_images/"
echo "   2. Run the test: node test-vlm-legend-analyzer.js"
echo "   3. Check results in: vlm_analysis_output/"
echo ""
echo "🚀 Happy analyzing!"
echo ""
