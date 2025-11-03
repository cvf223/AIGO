#!/bin/bash
echo "🛡️ Adding initialization guards to Quantum components..."

# Add guard to QuantumCoherenceEngine
echo "🔧 Fixing QuantumCoherenceEngine..."
cp src/quantum/QuantumCoherenceEngine.js src/quantum/QuantumCoherenceEngine.js.backup.guard

# Add import
sed -i "1a import { globalSingletonRegistry } from '../core/GlobalSingletonRegistry.js';" src/quantum/QuantumCoherenceEngine.js

# Add guard at start of initialize()
sed -i '/async initialize() {/a\        const existing = globalSingletonRegistry.get('"QuantumCoherenceEngine"');        if (existing) { console.log('"✅ QuantumCoherenceEngine already initialized - reusing"'); return existing; }        if (!globalSingletonRegistry.markInitializing('"QuantumCoherenceEngine"')) { console.warn('"⚠️ QuantumCoherenceEngine circular init"'); return null; }        console.log('"🚀 QuantumCoherenceEngine: First initialization..."');' src/quantum/QuantumCoherenceEngine.js

echo "✅ QuantumCoherenceEngine guard added"

# Add guard to QuantumSuperpositionEngine  
echo "🔧 Fixing QuantumSuperpositionEngine..."
cp src/quantum/QuantumSuperpositionEngine.js src/quantum/QuantumSuperpositionEngine.js.backup.guard

# Add import
sed -i "1a import { globalSingletonRegistry } from '../core/GlobalSingletonRegistry.js';" src/quantum/QuantumSuperpositionEngine.js

# Add guard
sed -i '/async initialize() {/a\        const existing = globalSingletonRegistry.get('"QuantumSuperpositionEngine"');        if (existing) { console.log('"✅ QuantumSuperpositionEngine already initialized - reusing"'); return existing; }        if (!globalSingletonRegistry.markInitializing('"QuantumSuperpositionEngine"')) { console.warn('"⚠️ QuantumSuperpositionEngine circular init"'); return null; }        console.log('"🚀 QuantumSuperpositionEngine: First initialization..."');' src/quantum/QuantumSuperpositionEngine.js

echo "✅ QuantumSuperpositionEngine guard added"
echo ""
echo "✅ Quantum guards added successfully!"
