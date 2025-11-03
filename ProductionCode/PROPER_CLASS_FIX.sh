#!/bin/bash

echo "🔧 Properly fixing the class structure..."

# Find the shutdown method (which should be the last method in the class)
SHUTDOWN_LINE=$(grep -n "async shutdown()" src/construction/ConstructionSyndicateOrchestrator.js | head -1 | cut -d: -f1)

if [ -n "$SHUTDOWN_LINE" ]; then
    echo "Found shutdown method at line $SHUTDOWN_LINE"
    
    # Find the closing brace of the shutdown method
    SHUTDOWN_END=$(tail -n +$SHUTDOWN_LINE src/construction/ConstructionSyndicateOrchestrator.js | grep -n "^    }$" | head -1 | cut -d: -f1)
    INSERT_LINE=$((SHUTDOWN_LINE + SHUTDOWN_END))
    
    echo "Will insert new methods after line $INSERT_LINE"
    
    # Create the new file structure
    head -n $INSERT_LINE src/construction/ConstructionSyndicateOrchestrator.js > TEMP_ORCHESTRATOR.js
    
    # Add the superintelligence methods
    cat >> TEMP_ORCHESTRATOR.js << 'EOF'
    
    /**
     * INTEGRATE FULL SUPERINTELLIGENCE - ACTUALLY USE IT!
     */
    async integrateFullSuperintelligence() {
        console.log('   🚀 INTEGRATING FULL SUPERINTELLIGENCE...');
        
        try {
            const { FullSuperintelligenceIntegration } = await import('./FULL_SUPERINTELLIGENCE_INTEGRATION.js');
            this.superintelligenceIntegration = new FullSuperintelligenceIntegration();
            
            const services = {
                quantityService: this.quantityService,
                complianceService: this.complianceService,
                visionEngine: this.visionEngine,
                errorService: this.errorService,
                documentService: this.documentService,
                tenderService: this.tenderService
            };
            
            const result = await this.superintelligenceIntegration.integrateAndActivateEverything(this, services);
            this.superintelligenceSystems = this.superintelligenceIntegration.systems;
            
            console.log('   ✅ SUPERINTELLIGENCE FULLY INTEGRATED!');
            this.processConstructionTask = this.processConstructionTaskWithSuperintelligence.bind(this);
            
            return result;
        } catch (error) {
            console.error('   ❌ Superintelligence integration failed:', error.message);
        }
    }
    
    /**
     * Process task with superintelligence
     */
    async processConstructionTaskWithSuperintelligence(task) {
        console.log('🧠 PROCESSING WITH FULL SUPERINTELLIGENCE...');
        
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
            if (zap) {
                console.log('   ⚡ Planning with Quantum ZAP...');
                result.enhancements.plan = await zap.plan(task);
            }
            
            if (autoformalization) {
                console.log('   🧮 Generating mathematical proofs...');
                result.enhancements.proofs = await autoformalization.autoformalize(task);
            }
            
            if (got) {
                console.log('   🕸️ Applying Graph-of-Thought...');
                result.enhancements.reasoning = await got.reason(task);
            }
            
            if (coa) {
                console.log('   ⛓️ Achieving multi-agent consensus...');
                result.enhancements.consensus = await coa.collaborate(task);
            }
        } catch (error) {
            console.error('   ⚠️ Superintelligence processing error:', error.message);
            result.error = error.message;
        }
        
        return result;
    }
}

console.log('🏗️ Construction Syndicate Orchestrator module loaded');
EOF
    
    # Replace the file
    mv TEMP_ORCHESTRATOR.js src/construction/ConstructionSyndicateOrchestrator.js
    
    echo "✅ Class structure properly fixed!"
else
    echo "⚠️ Could not find shutdown method"
fi

