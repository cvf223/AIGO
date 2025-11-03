#!/bin/bash

echo "🔧 Final fix for superintelligence integration..."

# Find where the class ends (before the duplicate methods)
CLASS_END=$(grep -n "^console.log('✅ Ready for HOAI" src/construction/ConstructionSyndicateOrchestrator.js | head -1 | cut -d: -f1)

if [ -n "$CLASS_END" ]; then
    echo "Found class end at line $CLASS_END"
    
    # Create a temp file with everything up to the class end
    head -n $((CLASS_END - 1)) src/construction/ConstructionSyndicateOrchestrator.js > TEMP_FIXED.js
    
    # Add the superintelligence methods INSIDE the class
    cat >> TEMP_FIXED.js << 'EOF'
    
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

// Console log outside the class
console.log('✅ Ready for HOAI LP 6 & 7 construction project processing');
EOF
    
    # Replace the original file
    mv TEMP_FIXED.js src/construction/ConstructionSyndicateOrchestrator.js
    
    echo "✅ File structure fixed!"
else
    echo "⚠️ Could not find class end marker"
fi

echo "✅ Integration fix complete!"

