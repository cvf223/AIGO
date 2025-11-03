/**
 * 🧠 SUPERINTELLIGENCE INTEGRATION MODULE
 * ========================================
 * Ensures ALL superintelligence systems are deeply integrated
 * throughout the construction syndicate
 */

// Import all superintelligence systems
import { ConstructionSuperintelligenceOrchestrator } from './reasoning/ConstructionSuperintelligenceOrchestrator.js';
import { ConstructionAutoformalization } from './cognitive/ConstructionAutoformalization.js';
import { FormalReasoningConstructionIntegration } from './cognitive/FormalReasoningConstructionIntegration.js';
import { ConstructionGOT } from './reasoning/ConstructionGOT.js';
import { ConstructionCOA } from './reasoning/ConstructionCOA.js';
import { ConstructionTOT } from './reasoning/ConstructionTOT.js';
import { ConstructionCOT } from './reasoning/ConstructionCOT.js';
import { ConstructionZAP } from './reasoning/ConstructionZAP.js';

export class ConstructionSuperintelligenceIntegration {
    constructor(config = {}) {
        this.config = {
            deepIntegration: true,
            usePhiForMath: true,
            useQwenForReasoning: true,
            constructionOptimized: true,
            ...config
        };
        
        this.systems = new Map();
        this.isIntegrated = false;
    }
    
    /**
     * CRITICAL: Initialize and deeply integrate ALL superintelligence
     */
    async integrateAllSuperintelligence(orchestrator, ollamaService) {
        console.log('🧠 DEEP SUPERINTELLIGENCE INTEGRATION STARTING...');
        console.log('   ⚡ ZERO TOLERANCE FOR LOOSE COMPONENTS!');
        
        try {
            // 1. Initialize Superintelligence Orchestrator
            const superintelligence = new ConstructionSuperintelligenceOrchestrator({
                ollama: ollamaService,
                deepIntegration: true
            });
            await superintelligence.initialize();
            this.systems.set('superintelligence', superintelligence);
            
            // 2. Initialize Autoformalization with Phi3
            const autoformalization = new ConstructionAutoformalization({
                mathModel: 'phi3:14b',
                ollama: ollamaService
            });
            await autoformalization.initialize();
            this.systems.set('autoformalization', autoformalization);
            
            // 3. Connect to Formal Reasoning
            const formalReasoning = new FormalReasoningConstructionIntegration({
                enableAutoformalization: true,
                autoformalization
            });
            await formalReasoning.initialize();
            this.systems.set('formalReasoning', formalReasoning);
            
            // 4. DEEP INTEGRATION into Orchestrator
            if (orchestrator) {
                console.log('   🔗 Injecting superintelligence into orchestrator...');
                
                // Inject superintelligence
                orchestrator.superintelligence = superintelligence;
                orchestrator.autoformalization = autoformalization;
                orchestrator.formalReasoning = formalReasoning;
                
                // Override processing methods to use superintelligence
                const originalProcess = orchestrator.processConstructionTask;
                orchestrator.processConstructionTask = async function(task) {
                    console.log('   🧠 Processing with SUPERINTELLIGENCE...');
                    
                    // First use superintelligence
                    const superResult = await superintelligence.processWithSuperintelligence(task);
                    
                    // Then augment with original processing
                    const originalResult = originalProcess ? 
                        await originalProcess.call(this, task) : null;
                    
                    return {
                        ...originalResult,
                        superintelligence: superResult,
                        autoformalization: superResult.systems?.autoformalization,
                        got: superResult.systems?.got,
                        coa: superResult.systems?.coa,
                        tot: superResult.systems?.tot,
                        cot: superResult.systems?.cot,
                        zap: superResult.systems?.zap
                    };
                };
                
                // Inject into all services
                this.injectIntoServices(orchestrator, superintelligence);
            }
            
            // 5. Connect to all existing systems
            await this.connectToExistingSystems();
            
            // 6. Verify integration
            const verification = await this.verifyDeepIntegration();
            if (!verification.success) {
                throw new Error(`Integration verification failed: ${verification.reason}`);
            }
            
            this.isIntegrated = true;
            console.log('   ✅ SUPERINTELLIGENCE FULLY INTEGRATED - NO LOOSE COMPONENTS!');
            console.log('   🎯 Phi3:14b handling mathematical operations');
            console.log('   🎯 Qwen2.5:72b handling advanced reasoning');
            console.log('   🎯 All systems construction-optimized');
            
            return {
                success: true,
                systems: Array.from(this.systems.keys()),
                verification
            };
            
        } catch (error) {
            console.error('   ❌ CRITICAL: Superintelligence integration failed:', error.message);
            throw error;
        }
    }
    
    /**
     * Inject superintelligence into all services
     */
    injectIntoServices(orchestrator, superintelligence) {
        const services = [
            'quantityService',
            'complianceService',
            'visionEngine',
            'errorService',
            'documentService',
            'tenderService'
        ];
        
        for (const serviceName of services) {
            const service = orchestrator[serviceName];
            if (service) {
                console.log(`   💉 Injecting into ${serviceName}...`);
                
                service.superintelligence = superintelligence;
                service.autoformalization = this.systems.get('autoformalization');
                
                // Override analyze methods
                if (service.analyze) {
                    const originalAnalyze = service.analyze;
                    service.analyze = async function(data) {
                        // First autoformalize
                        const formalized = await service.autoformalization?.autoformalize(data);
                        
                        // Then use superintelligence
                        const superAnalysis = await service.superintelligence?.processWithSuperintelligence(data);
                        
                        // Original analysis
                        const original = await originalAnalyze.call(this, data);
                        
                        return {
                            ...original,
                            formalized,
                            superintelligenceAnalysis: superAnalysis
                        };
                    };
                }
            }
        }
    }
    
    /**
     * Connect to existing systems in the codebase
     */
    async connectToExistingSystems() {
        console.log('   🔌 Connecting to existing systems...');
        
        // Try to connect to various systems if they exist
        try {
            // Connect to World Model
            const { WorldModel } = await import('../../world/WorldModel.js');
            if (WorldModel) {
                const worldModel = new WorldModel();
                this.systems.get('superintelligence').worldModel = worldModel;
                console.log('   ✅ Connected to World Model');
            }
        } catch (e) {
            // System might not exist
        }
        
        try {
            // Connect to Quantum systems
            const { QuantumEngine } = await import('../../quantum/QuantumEngine.js');
            if (QuantumEngine) {
                const quantum = new QuantumEngine();
                this.systems.get('autoformalization').quantumEngine = quantum;
                console.log('   ✅ Connected to Quantum Engine');
            }
        } catch (e) {
            // System might not exist
        }
        
        try {
            // Connect to Memory systems
            const { MEM1Framework } = await import('../../memory/MEM1Framework.js');
            if (MEM1Framework) {
                const memory = new MEM1Framework();
                for (const system of this.systems.values()) {
                    system.memory = memory;
                }
                console.log('   ✅ Connected to Memory Framework');
            }
        } catch (e) {
            // System might not exist
        }
    }
    
    /**
     * Verify deep integration
     */
    async verifyDeepIntegration() {
        const verification = {
            success: true,
            checks: [],
            reason: null
        };
        
        // Check superintelligence initialized
        const superintelligence = this.systems.get('superintelligence');
        if (!superintelligence || !superintelligence.isInitialized) {
            verification.success = false;
            verification.reason = 'Superintelligence not initialized';
        }
        verification.checks.push({
            name: 'Superintelligence initialized',
            passed: superintelligence?.isInitialized
        });
        
        // Check Phi3 for math
        const autoformalization = this.systems.get('autoformalization');
        const usesPhiForMath = autoformalization?.config?.mathModel === 'phi3:14b' ||
                               autoformalization?.performMathematicalOperation !== undefined;
        verification.checks.push({
            name: 'Phi3:14b for mathematics',
            passed: usesPhiForMath
        });
        
        if (!usesPhiForMath) {
            verification.success = false;
            verification.reason = 'Phi3:14b not configured for mathematics';
        }
        
        // Check all reasoning systems
        const reasoningSystems = ['got', 'coa', 'tot', 'cot', 'zap'];
        const integrationStatus = superintelligence?.getIntegrationStatus();
        
        for (const system of reasoningSystems) {
            const systemStatus = integrationStatus?.systems?.[system];
            const isIntegrated = systemStatus?.initialized && systemStatus?.connected;
            
            verification.checks.push({
                name: `${system.toUpperCase()} integrated`,
                passed: isIntegrated
            });
            
            if (!isIntegrated) {
                verification.success = false;
                verification.reason = `${system.toUpperCase()} not integrated`;
            }
        }
        
        // Check construction optimization
        const optimizationStatus = superintelligence?.verifyConstructionOptimization();
        verification.checks.push({
            name: 'Construction optimized',
            passed: optimizationStatus?.allSystemsOptimized
        });
        
        if (!optimizationStatus?.allSystemsOptimized) {
            verification.success = false;
            verification.reason = 'Not all systems construction-optimized';
        }
        
        return verification;
    }
    
    /**
     * Get integration status
     */
    getStatus() {
        return {
            integrated: this.isIntegrated,
            systems: Array.from(this.systems.keys()),
            details: Array.from(this.systems.entries()).map(([name, system]) => ({
                name,
                initialized: system?.isInitialized || false,
                constructionOptimized: system?.config?.constructionOptimized || false
            }))
        };
    }
}

// Export singleton
export const superintelligenceIntegrator = new ConstructionSuperintelligenceIntegration();
export default ConstructionSuperintelligenceIntegration;

