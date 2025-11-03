/**
 * AlphaGo Elite Arbitrage System
 * 
 * Main entry point for the AlphaGo Elite arbitrage trading system
 * Exports all components for easy use
 */

// Core components
export { AlphaGoEliteCore } from './core/AlphaGoEliteCore.js';

// Capability awareness system
export { CapabilityAwarenessSystem } from './capability/CapabilityAwarenessSystem.js';

// Learning systems
export { ReinforcementLearningEngine } from './learning/ReinforcementLearningEngine.js';
export { CollectiveLearningSystem } from './learning/CollectiveLearningSystem.js';
export { NeuralOptimizationEngine } from './learning/NeuralOptimizationEngine.js';

// Main integration
export { AlphaGoEliteIntegration } from './AlphaGoEliteIntegration.js';

// Example implementation
export * from './examples/ArbitrageAgentImplementation.js';

/**
 * Initialize the AlphaGo Elite system with default configuration
 * Convenience function for quick setup
 * @returns {Promise<Object>} AlphaGo Elite integration instance
 */
export async function initializeAlphaGoElite() {
  const { AlphaGoEliteIntegration } = await import('./AlphaGoEliteIntegration.js');
  const integration = new AlphaGoEliteIntegration();
  await integration.initialize();
  return integration;
}

/**
 * Create a default set of agents for the AlphaGo Elite system
 * Convenience function for quick setup
 * @param {Object} integration - AlphaGo Elite integration instance
 * @returns {Promise<Object>} Created agents
 */
export async function createDefaultAgents(integration) {
  if (!integration) {
    throw new Error('AlphaGoEliteIntegration instance required');
  }
  
  const { initializeArbitrageSystem } = await import('./examples/ArbitrageAgentImplementation.js');
  return await initializeArbitrageSystem();
} 