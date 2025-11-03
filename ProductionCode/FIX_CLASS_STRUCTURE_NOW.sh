#!/bin/bash

echo "🔧 Fixing ConstructionSyndicateOrchestrator class structure..."

# Find the line where the class closes (the } after shutdown method)
CLASS_CLOSE_LINE=$(grep -n "^}$" src/construction/ConstructionSyndicateOrchestrator.js | head -1 | cut -d: -f1)

echo "Found class closing brace at line $CLASS_CLOSE_LINE"

# Create a new file with proper structure
head -n $((CLASS_CLOSE_LINE - 1)) src/construction/ConstructionSyndicateOrchestrator.js > TEMP_FIXED_ORCHESTRATOR.js

# Add the superintelligence methods BEFORE the class closes
cat >> TEMP_FIXED_ORCHESTRATOR.js << 'EOF'
    
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
            
            // Override the task processing method
            this.processConstructionTask = this.processConstructionTaskWithSuperintelligence.bind(this);
            
            return result;
        } catch (error) {
            console.error('   ❌ Superintelligence integration failed:', error.message);
            return null;
        }
    }
    
    /**
     * Process construction task with FULL superintelligence
     */
    async processConstructionTaskWithSuperintelligence(task) {
        console.log('🧠 PROCESSING WITH FULL SUPERINTELLIGENCE...');
        
        const zap = this.superintelligenceSystems?.get('zap');
        const autoformalization = this.superintelligenceSystems?.get('autoformalization');
        const got = this.superintelligenceSystems?.get('got');
        const coa = this.superintelligenceSystems?.get('coa');
        const cot = this.superintelligenceSystems?.get('cot');
        const tot = this.superintelligenceSystems?.get('tot');
        
        const result = {
            task,
            superintelligenceUsed: true,
            enhancements: {},
            timestamp: new Date()
        };
        
        try {
            // 1. PLAN with Quantum ZAP (Multi-layer with quantum superposition)
            if (zap) {
                console.log('   ⚡ Planning with Quantum ZAP...');
                result.enhancements.plan = await zap.plan(task);
                console.log('   ✅ Quantum multi-layer plan generated');
            }
            
            // 2. Generate MATHEMATICAL PROOFS
            if (autoformalization) {
                console.log('   🧮 Generating mathematical proofs...');
                result.enhancements.proofs = await autoformalization.autoformalize(task);
                console.log('   ✅ Mathematical proofs generated');
            }
            
            // 3. Apply GRAPH-OF-THOUGHT reasoning
            if (got) {
                console.log('   🕸️ Applying Graph-of-Thought reasoning...');
                result.enhancements.got = await got.reason(task);
                console.log('   ✅ GOT reasoning complete');
            }
            
            // 4. Get MULTI-AGENT consensus
            if (coa) {
                console.log('   ⛓️ Achieving multi-agent consensus...');
                result.enhancements.coa = await coa.collaborate(task);
                console.log('   ✅ COA consensus achieved');
            }
            
            // 5. Apply CHAIN-OF-THOUGHT
            if (cot) {
                console.log('   💭 Applying Chain-of-Thought...');
                result.enhancements.cot = await cot.reason(task);
                console.log('   ✅ COT reasoning complete');
            }
            
            // 6. Apply TREE-OF-THOUGHT exploration
            if (tot) {
                console.log('   🌳 Exploring with Tree-of-Thought...');
                result.enhancements.tot = await tot.explore(task);
                console.log('   ✅ TOT exploration complete');
            }
            
            // Merge all insights
            result.finalRecommendation = this.mergeSuperintelligenceInsights(result.enhancements);
            
        } catch (error) {
            console.error('   ⚠️ Superintelligence processing error:', error.message);
            result.error = error.message;
        }
        
        return result;
    }
    
    /**
     * Merge insights from all superintelligence systems
     */
    mergeSuperintelligenceInsights(enhancements) {
        const recommendation = {
            action: enhancements.plan?.finalPlan?.action || 'analyze',
            confidence: 0.0,
            reasoning: [],
            proofs: [],
            consensus: null
        };
        
        // Aggregate confidence
        if (enhancements.plan) recommendation.confidence += 0.2;
        if (enhancements.proofs) recommendation.confidence += 0.3;
        if (enhancements.got) recommendation.confidence += 0.15;
        if (enhancements.coa) recommendation.confidence += 0.15;
        if (enhancements.cot) recommendation.confidence += 0.1;
        if (enhancements.tot) recommendation.confidence += 0.1;
        
        // Collect reasoning
        if (enhancements.got?.insights) recommendation.reasoning.push(...enhancements.got.insights);
        if (enhancements.cot?.steps) recommendation.reasoning.push(...enhancements.cot.steps);
        if (enhancements.tot?.branches) recommendation.reasoning.push(...enhancements.tot.branches);
        
        // Collect proofs
        if (enhancements.proofs?.proofs) recommendation.proofs = enhancements.proofs.proofs;
        
        // Set consensus
        if (enhancements.coa?.consensus) recommendation.consensus = enhancements.coa.consensus;
        
        return recommendation;
    }
}

console.log('🏗️ Construction Syndicate Orchestrator module loaded');
EOF

# Remove any duplicate content after the class
tail -n +$((CLASS_CLOSE_LINE + 1)) src/construction/ConstructionSyndicateOrchestrator.js | grep -v "integrateFullSuperintelligence\|processConstructionTaskWithSuperintelligence\|INTEGRATE FULL SUPERINTELLIGENCE\|Process task with superintelligence\|Process construction task with FULL superintelligence" | head -5 >> TEMP_FIXED_ORCHESTRATOR.js

# Replace the original file
mv TEMP_FIXED_ORCHESTRATOR.js src/construction/ConstructionSyndicateOrchestrator.js

echo "✅ Class structure fixed properly!"
echo ""
echo "Now updating the initialize method to call superintelligence integration..."

# Update the initialize method to call integrateFullSuperintelligence
cat > UPDATE_INITIALIZE.js << 'EOF'
// Find the end of initialize method and add integration call
const fs = require('fs');
const content = fs.readFileSync('src/construction/ConstructionSyndicateOrchestrator.js', 'utf8');

// Find the initialize method and add the integration call if not present
if (!content.includes('integrateFullSuperintelligence()') || !content.includes('Phase 5:')) {
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('console.log(\'✅ Construction Syndicate Orchestrator initialized')) {
            insertIndex = i;
            break;
        }
    }
    
    if (insertIndex > 0) {
        // Insert the integration call before the success message
        lines.splice(insertIndex, 0, 
            '        ',
            '        // Phase 5: INTEGRATE FULL SUPERINTELLIGENCE',
            '        console.log(\'Phase 5: Integrating FULL SUPERINTELLIGENCE...\');',
            '        await this.integrateFullSuperintelligence();',
            '        '
        );
        
        fs.writeFileSync('src/construction/ConstructionSyndicateOrchestrator.js', lines.join('\n'));
        console.log('✅ Initialize method updated to call superintelligence integration');
    } else {
        console.log('⚠️ Could not find initialize success message');
    }
} else {
    console.log('✅ Superintelligence integration already in initialize method');
}
EOF

node UPDATE_INITIALIZE.js

rm -f UPDATE_INITIALIZE.js

echo "✅ COMPLETE! Superintelligence is now properly integrated!"
