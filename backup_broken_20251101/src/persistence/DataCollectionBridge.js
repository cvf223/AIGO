/**
 * 🌉 DATA COLLECTION BRIDGE
 * ========================
 * 
 * Connects all syndicate systems to the NonLLMDataCollector
 * ensuring data is persisted even without LLM processing.
 * 
 * TOP 1% IMPLEMENTATION - Production Ready!
 */

import { nonLLMCollector } from './NonLLMDataCollector.js';

export class DataCollectionBridge {
    constructor() {
        this.connected = false;
        this.systems = new Map();
        this.stats = {
            eventsForwarded: 0,
            systemsConnected: 0
        };
        
        console.log('🌉 Data Collection Bridge initialized');
    }
    
    /**
     * 🔥 Connect a system for automatic data collection
     */
    connectSystem(systemName, systemInstance) {
        console.log(`   🔗 Connecting ${systemName} to data collector...`);
        
        try {
            // Hook into system events based on type
            if (systemName.includes('AlphaGnome')) {
                this.connectAlphaGnome(systemInstance);
            } else if (systemName.includes('Evolution')) {
                this.connectEvolutionSystem(systemInstance);
            } else if (systemName.includes('Blockchain')) {
                this.connectBlockchainSystem(systemInstance);
            } else if (systemName.includes('Agent')) {
                this.connectAgentSystem(systemInstance);
            }
            
            // Generic event forwarding for any EventEmitter
            if (systemInstance.on && typeof systemInstance.on === 'function') {
                this.setupGenericForwarding(systemName, systemInstance);
            }
            
            this.systems.set(systemName, systemInstance);
            this.stats.systemsConnected++;
            
            console.log(`   ✅ ${systemName} connected to collector`);
            
        } catch (error) {
            console.error(`   ❌ Failed to connect ${systemName}:`, error.message);
        }
    }
    
    connectAlphaGnome(alphaGnome) {
        // Listen for evolution events
        if (alphaGnome.on) {
            alphaGnome.on('generation_complete', (data) => {
                nonLLMCollector.collectAlphaGnomeData({
                    type: 'generation_complete',
                    generation: data.generation,
                    bestFitness: data.bestFitness,
                    avgFitness: data.avgFitness,
                    populationSize: data.populationSize,
                    timestamp: new Date()
                });
                this.stats.eventsForwarded++;
            });
            
            alphaGnome.on('mutation', (data) => {
                nonLLMCollector.collectAlphaGnomeData({
                    type: 'mutation',
                    ...data,
                    timestamp: new Date()
                });
                this.stats.eventsForwarded++;
            });
            
            alphaGnome.on('sparring_result', (data) => {
                nonLLMCollector.collectAlphaGnomeData({
                    type: 'sparring',
                    winner: data.winner,
                    loser: data.loser,
                    score: data.score,
                    timestamp: new Date()
                });
                this.stats.eventsForwarded++;
            });
        }
        
        // Hook into methods to capture data
        if (alphaGnome.evaluateFitness) {
            const originalEvaluate = alphaGnome.evaluateFitness.bind(alphaGnome);
            alphaGnome.evaluateFitness = async (...args) => {
                const result = await originalEvaluate(...args);
                
                // Capture fitness evaluations
                nonLLMCollector.collectAlphaGnomeData({
                    type: 'fitness_evaluation',
                    fitness: result,
                    timestamp: new Date()
                });
                
                return result;
            };
        }
    }
    
    connectEvolutionSystem(system) {
        // Capture quantum evolution data
        if (system.on) {
            system.on('evolution_cycle', (data) => {
                process.emit('SYNDICATE:EVOLUTION_DATA', {
                    source: 'quantum_evolution',
                    ...data
                });
                this.stats.eventsForwarded++;
            });
            
            system.on('quantum_state_update', (data) => {
                nonLLMCollector.collectEvolutionData({
                    type: 'quantum_state',
                    coherence: data.coherence,
                    entanglement: data.entanglement,
                    timestamp: new Date()
                });
                this.stats.eventsForwarded++;
            });
        }
    }
    
    connectBlockchainSystem(system) {
        // Capture blockchain data
        if (system.getAllActivePools) {
            // Periodically save pool states
            setInterval(async () => {
                try {
                    const pools = await system.getAllActivePools('ethereum');
                    if (pools && pools.length > 0) {
                        process.emit('SYNDICATE:BLOCKCHAIN_DATA', {
                            type: 'pool_snapshot',
                            chain: 'ethereum',
                            poolCount: pools.length,
                            timestamp: new Date()
                        });
                        this.stats.eventsForwarded++;
                    }
                } catch (error) {
                    // Silent fail - blockchain might not be available
                }
            }, 300000); // Every 5 minutes
        }
        
        // Hook into transaction monitoring
        if (system.on) {
            system.on('arbitrage_detected', (data) => {
                process.emit('SYNDICATE:BLOCKCHAIN_DATA', {
                    type: 'arbitrage_opportunity',
                    ...data
                });
                this.stats.eventsForwarded++;
            });
        }
    }
    
    connectAgentSystem(agent) {
        // Capture agent actions
        if (agent.on) {
            agent.on('action_taken', (data) => {
                process.emit('SYNDICATE:AGENT_ACTION', {
                    agent_id: agent.id || 'unknown',
                    ...data
                });
                this.stats.eventsForwarded++;
            });
            
            agent.on('learning_update', (data) => {
                nonLLMCollector.collectAgentAction({
                    agent_id: agent.id,
                    action_type: 'learning',
                    ...data
                });
                this.stats.eventsForwarded++;
            });
        }
        
        // Hook into decision making
        if (agent.makeDecision) {
            const originalDecision = agent.makeDecision.bind(agent);
            agent.makeDecision = async (...args) => {
                const decision = await originalDecision(...args);
                
                process.emit('SYNDICATE:AGENT_ACTION', {
                    agent_id: agent.id,
                    action_type: 'decision',
                    decision: decision,
                    timestamp: new Date()
                });
                this.stats.eventsForwarded++;
                
                return decision;
            };
        }
    }
    
    setupGenericForwarding(systemName, system) {
        // Forward important events generically
        const importantEvents = [
            'error', 'warning', 'success',
            'state_change', 'update', 'complete',
            'checkpoint', 'save', 'load'
        ];
        
        importantEvents.forEach(eventName => {
            system.on(eventName, (data) => {
                nonLLMCollector.forceSave(`${systemName}_${eventName}`, {
                    system: systemName,
                    event: eventName,
                    data: data,
                    timestamp: new Date()
                });
                this.stats.eventsForwarded++;
            });
        });
    }
    
    /**
     * 🔥 Connect all systems from service registry
     */
    connectServiceRegistry(serviceRegistry) {
        console.log('🔗 Connecting all systems from service registry...');
        
        if (!serviceRegistry) {
            console.error('❌ No service registry available');
            return;
        }
        
        // Systems to prioritize for data collection
        const prioritySystems = [
            'alphaGnomeEvolution',
            'quantumEvolutionMaster',
            'realBlockchainIntegration',
            'marketStateService',
            'adaptiveMetaLearning',
            'competitiveIntelligence',
            'alphaFoldPredictor'
        ];
        
        // Connect priority systems first
        for (const systemName of prioritySystems) {
            if (serviceRegistry[systemName]) {
                this.connectSystem(systemName, serviceRegistry[systemName]);
            }
        }
        
        // Connect all other systems
        for (const [key, value] of Object.entries(serviceRegistry)) {
            if (value && !this.systems.has(key)) {
                this.connectSystem(key, value);
            }
        }
        
        console.log(`✅ Connected ${this.stats.systemsConnected} systems to data collector`);
    }
    
    /**
     * 🔥 Force immediate data collection
     */
    async collectNow(type, data) {
        await nonLLMCollector.forceSave(type, data);
    }
    
    getStats() {
        return {
            ...this.stats,
            collectorStats: nonLLMCollector.stats
        };
    }
}

// Export singleton
export const dataCollectionBridge = new DataCollectionBridge();
