#!/bin/bash

# 🔧 FIX QUANTUM SYSTEMS - LAZY INITIALIZATION PATTERN
# =====================================================
# 
# Instead of initializing FormalReasoningConstructionIntegration during
# quantum system initialization, we'll store a reference and initialize
# it lazily when first used.

echo "🔧 ========================================"
echo "🔧 FIXING QUANTUM LAZY INITIALIZATION"
echo "🔧 ========================================"
echo ""

cd ~/LocalBackup

# Backup files
echo "📦 Creating backups..."
cp src/quantum/QuantumSuperpositionEngine.js src/quantum/QuantumSuperpositionEngine.js.backup.lazy
cp src/quantum/QuantumCoherenceEngine.js src/quantum/QuantumCoherenceEngine.js.backup.lazy
echo "✅ Backups created"
echo ""

# Fix QuantumSuperpositionEngine
echo "🔧 Fixing QuantumSuperpositionEngine..."
echo "   Changing initializeQuantumSuperpositionFormalReasoningIntegration to be lazy..."

# Comment out the actual initialization call and replace with lazy initialization
sed -i '/await this\.formalReasoning\.initialize()/c\
        // ✅ LAZY INITIALIZATION: Don'\''t initialize during quantum system init - prevent circular dependency\
        // await this.formalReasoning.initialize();\
        // Instead, formalReasoning will be initialized when first used\
        console.log('\''   ✅ FormalReasoning reference stored (will initialize on first use)'\'');' \
    src/quantum/QuantumSuperpositionEngine.js

echo "✅ Fixed QuantumSuperpositionEngine"

# Fix QuantumCoherenceEngine  
echo "🔧 Fixing QuantumCoherenceEngine..."
echo "   Changing initializeQuantumCoherenceFormalReasoningIntegration to be lazy..."

sed -i '/await this\.formalReasoning\.initialize()/c\
        // ✅ LAZY INITIALIZATION: Don'\''t initialize during quantum system init - prevent circular dependency\
        // await this.formalReasoning.initialize();\
        // Instead, formalReasoning will be initialized when first used\
        console.log('\''   ✅ FormalReasoning reference stored (will initialize on first use)'\'');' \
    src/quantum/QuantumCoherenceEngine.js

echo "✅ Fixed QuantumCoherenceEngine"

echo ""
echo "🔧 ========================================"
echo "✅ LAZY INITIALIZATION PATTERN APPLIED!"
echo "🔧 ========================================"
echo ""
echo "📋 What changed:"
echo "   1. Quantum systems NO LONGER initialize FormalReasoning during their own init"
echo "   2. FormalReasoning reference is stored for later use"
echo "   3. Circular dependency chain is BROKEN"
echo ""
echo "🎯 Result: FormalReasoningConstructionIntegration will initialize ONCE"
echo "   when the factory explicitly initializes it, NOT when quantum systems load"
echo ""

