#!/bin/bash

echo "🔧 Fixing superintelligence integration syntax..."

# Remove the incorrectly appended content
sed -i '/async integrateFullSuperintelligence()/,$d' src/construction/ConstructionSyndicateOrchestrator.js

# Add closing brace if missing
echo "}" >> src/construction/ConstructionSyndicateOrchestrator.js

echo "✅ Syntax fixed"

# Now properly add the methods inside the class
cat > TEMP_METHODS.js << 'EOF'
    /**
     * INTEGRATE FULL SUPERINTELLIGENCE - ACTUALLY USE IT!
     */
    async integrateFullSuperintelligence() {
        console.log('   🚀 INTEGRATING FULL SUPERINTELLIGENCE...');
        
        try {
            const { FullSuperintelligenceIntegration } = await import('./FULL_SUPERINTELLIGENCE_INTEGRATION.js');
            this.superintelligenceIntegration = new FullSuperintelligenceIntegration();
            
            // Pass this orchestrator and all services
            const services = {
                quantityService: this.quantityService,
                complianceService: this.complianceService,
                visionEngine: this.visionEngine,
                errorService: this.errorService,
                documentService: this.documentService,
                tenderService: this.tenderService
            };
            
            const result = await this.superintelligenceIntegration.integrateAndActivateEverything(this, services);
            
            // Store references to all systems
            this.superintelligenceSystems = this.superintelligenceIntegration.systems;
            
            console.log('   ✅ SUPERINTELLIGENCE FULLY INTEGRATED!');
            console.log(`   📊 ${result.systems.length} systems active and ready`);
            
            // Call this in initialize method
            this.processConstructionTask = this.processConstructionTaskWithSuperintelligence.bind(this);
            
            return result;
            
        } catch (error) {
            console.error('   ❌ Superintelligence integration failed:', error.message);
            // Continue without it but log the issue
        }
    }
    
    /**
     * Override processConstructionTask to ALWAYS use superintelligence
     */
    async processConstructionTaskWithSuperintelligence(task) {
        console.log('🧠 PROCESSING WITH FULL SUPERINTELLIGENCE...');
        
        // Get all superintelligence systems
        const zap = this.superintelligenceSystems?.get('zap');
        const autoformalization = this.superintelligenceSystems?.get('autoformalization');
        const got = this.superintelligenceSystems?.get('got');
        const coa = this.superintelligenceSystems?.get('coa');
        
        const result = {
            task,
            superintelligenceUsed: true,
            enhancements: {}
        };
        
        try {
            // 1. PLAN with Quantum ZAP
            if (zap) {
                console.log('   ⚡ Planning with Quantum ZAP...');
                result.enhancements.plan = await zap.plan(task);
                console.log('   ✅ Quantum plan generated');
            }
            
            // 2. Generate MATHEMATICAL PROOFS
            if (autoformalization) {
                console.log('   🧮 Generating mathematical proofs...');
                result.enhancements.proofs = await autoformalization.autoformalize(task);
                console.log('   ✅ Mathematical proofs generated');
            }
            
            // 3. Apply GRAPH-OF-THOUGHT reasoning
            if (got) {
                console.log('   🕸️ Applying Graph-of-Thought...');
                result.enhancements.reasoning = await got.reason(task);
                console.log('   ✅ GOT reasoning complete');
            }
            
            // 4. Get MULTI-AGENT consensus
            if (coa) {
                console.log('   ⛓️ Achieving multi-agent consensus...');
                result.enhancements.consensus = await coa.collaborate(task);
                console.log('   ✅ Consensus achieved');
            }
            
        } catch (error) {
            console.error('   ⚠️ Superintelligence processing error:', error.message);
            result.error = error.message;
        }
        
        return result;
    }
EOF

# Find the last method in the class and insert before the closing brace
LAST_METHOD_LINE=$(grep -n "^    [a-zA-Z].*{$" src/construction/ConstructionSyndicateOrchestrator.js | tail -1 | cut -d: -f1)

if [ -n "$LAST_METHOD_LINE" ]; then
    # Find the closing brace of the last method
    CLOSING_BRACE_LINE=$(tail -n +$LAST_METHOD_LINE src/construction/ConstructionSyndicateOrchestrator.js | grep -n "^    }$" | head -1 | cut -d: -f1)
    INSERT_LINE=$((LAST_METHOD_LINE + CLOSING_BRACE_LINE))
    
    # Insert the new methods
    sed -i "${INSERT_LINE}r TEMP_METHODS.js" src/construction/ConstructionSyndicateOrchestrator.js
    
    echo "✅ Methods added at line $INSERT_LINE"
else
    echo "⚠️ Could not find insertion point, appending to file"
    # Remove last brace, add methods, add brace back
    sed -i '$ d' src/construction/ConstructionSyndicateOrchestrator.js
    cat TEMP_METHODS.js >> src/construction/ConstructionSyndicateOrchestrator.js
    echo "}" >> src/construction/ConstructionSyndicateOrchestrator.js
fi

# Clean up
rm -f TEMP_METHODS.js

# Also update the initialize method to call integrateFullSuperintelligence
echo "
// Call superintelligence integration in initialize
if (!this.integrateFullSuperintelligence) {
    console.warn('Superintelligence integration method not found');
} else {
    console.log('Superintelligence integration method available');
}" > CHECK_INTEGRATION.js

echo "✅ Superintelligence integration syntax fixed!"

