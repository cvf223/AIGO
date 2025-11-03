/**
 * 🧠 AWARENESS CONNECTOR
 * ======================
 * 
 * Simple integration of all awareness capabilities from /learning/ folder
 * with character configuration as single source of truth.
 */

import { EventEmitter } from 'events';

class AwarenessConnector extends EventEmitter {
    private character: any;
    private isActive: boolean = false;

    constructor(character: any) {
        super();
        this.character = character;
    }

    async initialize(): Promise<boolean> {
        try {
            console.log('🧠 Initializing Awareness Connector...');

            // Check if awareness configuration exists
            if (this.character.awarenessConfiguration) {
                console.log('✅ Awareness configuration found in character');
                console.log('📊 Self-awareness enabled:', this.character.awarenessConfiguration.selfAwareness?.capabilityTracking);
                console.log('🤝 Social awareness enabled:', this.character.awarenessConfiguration.socialAwareness?.agentTracking);
                console.log('🌍 Environment awareness enabled:', this.character.awarenessConfiguration.environmentAwareness?.marketMonitoring);
                console.log('🏆 Competitive awareness enabled:', this.character.awarenessConfiguration.competitiveAwareness?.competitorProfiling);
                console.log('🧠 Meta-awareness enabled:', this.character.awarenessConfiguration.metaAwareness?.awarenessOptimization);
            } else {
                console.log('❌ No awareness configuration found in character');
                return false;
            }

            // Check reinforcement learning configuration
            if (this.character.reinforcementLearning) {
                console.log('✅ Reinforcement learning configuration found');
                console.log('🎯 RL Algorithm:', this.character.reinforcementLearning.algorithm);
                console.log('📈 Learning rate:', this.character.reinforcementLearning.learningRate);
                console.log('🎪 Elite enhancement enabled:', this.character.reinforcementLearning.eliteEnhancement?.enabled);
                
                // Show capability levels
                const capabilities = this.character.reinforcementLearning.capabilities;
                if (capabilities) {
                    console.log('⚡ Current capabilities:');
                    console.log('  - Flash loans:', capabilities.arbitrage?.flashLoans);
                    console.log('  - Arbitrum mastery:', capabilities.blockchain?.arbitrum);
                    console.log('  - Execution speed:', capabilities.trading?.executionSpeed);
                    console.log('  - Pattern recognition:', capabilities.intelligence?.patternRecognition);
                    console.log('  - Teamwork:', capabilities.social?.teamwork);
                    console.log('  - Adaptability:', capabilities.learning?.adaptability);
                }
            }

            this.isActive = true;
            console.log('✅ Awareness Connector active');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize awareness connector:', (error as Error).message);
            return false;
        }
    }

    getAwarenessState(): any {
        return {
            isActive: this.isActive,
            configuration: this.character.awarenessConfiguration,
            reinforcementLearning: this.character.reinforcementLearning,
            capabilities: this.character.reinforcementLearning?.capabilities,
            performance: this.character.reinforcementLearning?.performance,
            timestamp: Date.now()
        };
    }

    updateCapability(domain: string, capability: string, improvement: number): void {
        if (this.character.reinforcementLearning?.capabilities?.[domain]) {
            const currentLevel = this.character.reinforcementLearning.capabilities[domain][capability] || 0;
            const newLevel = Math.min(1.0, currentLevel + improvement);
            this.character.reinforcementLearning.capabilities[domain][capability] = newLevel;
            
            console.log(`🧠 Capability updated: ${domain}.${capability} ${currentLevel.toFixed(2)} → ${newLevel.toFixed(2)}`);
            this.emit('capabilityUpdated', { domain, capability, oldLevel: currentLevel, newLevel, improvement });
        }
    }

    recordPerformance(metrics: any): void {
        if (this.character.reinforcementLearning?.performance) {
            Object.assign(this.character.reinforcementLearning.performance, metrics);
            console.log('📊 Performance updated:', metrics);
            this.emit('performanceUpdated', metrics);
        }
    }
}

export { AwarenessConnector }; 