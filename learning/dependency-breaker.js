/**
 * Dependency Breaker
 * 
 * Provides a lightweight dependency injection system to prevent circular dependencies.
 * Systems can register themselves and others can access them through this central hub.
 */

// Removed @elizaos/core dependency - using console for logging

// Map of registered systems
const registeredSystems = new Map();

// Map of waiting promises
const waitingPromises = new Map();

/**
 * Register a system in the dependency registry
 * @param {string} systemName - Name of the system
 * @param {Object} system - System implementation
 */
export function registerSystem(systemName, system) {
  registeredSystems.set(systemName, system);
  console.info(`⭐ ${systemName} system registered successfully`);
  
  // Resolve any pending promises waiting for this system
  if (waitingPromises.has(systemName)) {
    const promises = waitingPromises.get(systemName);
    promises.forEach(({ resolve }) => resolve(system));
    waitingPromises.delete(systemName);
  }
}

/**
 * Get a system from the registry if available
 * @param {string} systemName - Name of the system to retrieve
 * @returns {Object|null} - The system or null if not found
 */
export function getSystem(systemName) {
  return registeredSystems.get(systemName) || null;
}

/**
 * Check if a system is registered
 * @param {string} systemName - Name of the system to check
 * @returns {boolean} - Whether the system is registered
 */
export function hasSystem(systemName) {
  return registeredSystems.has(systemName);
}

/**
 * Wait for a system to be registered
 * @param {string} systemName - Name of the system to wait for
 * @param {number} timeout - Optional timeout in milliseconds
 * @returns {Promise<Object>} - The system when registered
 */
export function waitForSystem(systemName, timeout = 5000) {
  // If the system is already registered, return it immediately
  if (registeredSystems.has(systemName)) {
    return Promise.resolve(registeredSystems.get(systemName));
  }
  
  // Otherwise, create a promise that will be resolved when the system is registered
  return new Promise((resolve, reject) => {
    // Create the promise entry
    const promiseEntry = { resolve, reject };
    
    // Add it to the waiting promises for this system
    if (!waitingPromises.has(systemName)) {
      waitingPromises.set(systemName, []);
    }
    waitingPromises.get(systemName).push(promiseEntry);
    
    // Set a timeout to reject the promise if the system isn't registered in time
    setTimeout(() => {
      // Check if this promise is still waiting
      const promiseList = waitingPromises.get(systemName);
      if (promiseList && promiseList.includes(promiseEntry)) {
        // Remove this promise from the waiting list
        const index = promiseList.indexOf(promiseEntry);
        promiseList.splice(index, 1);
        
        // If there are no more promises waiting for this system, remove the entry
        if (promiseList.length === 0) {
          waitingPromises.delete(systemName);
        }
        
        // Reject the promise
        reject(new Error(`Timeout waiting for system ${systemName}`));
      }
    }, timeout);
  });
}

/**
 * Force register a stub knowledge learning system to prevent hangs
 */
export async function registerRealKnowledgeSystem() {
  if (!hasSystem('knowledge-learning-system')) {
    try {
      // Try to load the real KnowledgeDistillationService
      const { KnowledgeDistillationService } = await import('../src/services/KnowledgeDistillationService.js');
      
      const realKnowledgeSystem = {
        service: null,
        
        async initializeKnowledgeLearning() {
          try {
            console.info('🧠 Initializing real knowledge learning system...');
            this.service = new KnowledgeDistillationService({ dbPool: global.dbPool });
            await this.service.initialize();
            console.log('✅ Real knowledge learning system initialized');
            return true;
          } catch (error) {
            console.warn('⚠️ Failed to initialize real knowledge system:', error.message);
            return false;
          }
        },
        
        async searchKnowledge(query) {
          try {
            if (this.service && this.service.queryWorldModel) {
              const results = await this.service.queryWorldModel({ searchTerm: query });
              return { results, message: `Found ${results.length} knowledge entries for: ${query}` };
            }
            return { results: [], message: `Knowledge service not ready for query: ${query}` };
          } catch (error) {
            console.error('Knowledge search error:', error);
            return { results: [], message: `Error searching for: ${query}` };
          }
        },
        
        async generateKnowledgeSummary() {
          try {
            if (this.service && this.service.performDistillationCycle) {
              const summary = await this.service.performDistillationCycle();
              return { summary: `Knowledge distillation complete: ${summary.keyDevelopments?.length || 0} developments identified` };
            }
            return { summary: 'Knowledge system available but not ready for summary generation' };
          } catch (error) {
            console.error('Knowledge summary error:', error);
            return { summary: 'Error generating knowledge summary' };
          }
        },
        
        async getKnowledgeGraph() {
          try {
            if (this.service && this.service.extractEntitiesAndRelationships) {
              const entities = await this.service.extractEntitiesAndRelationships();
              const nodes = entities.map(e => ({ id: e.name, label: e.name, type: e.type }));
              const edges = entities.flatMap(e => 
                (e.relationships || []).map(r => ({ source: e.name, target: r.target, type: r.type }))
              );
              return { nodes, edges };
            }
            return { nodes: [], edges: [] };
          } catch (error) {
            console.error('Knowledge graph error:', error);
            return { nodes: [], edges: [] };
          }
        },
        
        extractKeywords: (text) => {
          // Enhanced keyword extraction with stop words filtering
          const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those']);
          return text.toLowerCase()
            .split(/\W+/)
            .filter(word => word.length > 4 && !stopWords.has(word))
            .slice(0, 10);
        }
      };
      
      registerSystem('knowledge-learning-system', realKnowledgeSystem);
      console.log('✅ Registered REAL knowledge learning system');
      
      // Initialize the system
      await realKnowledgeSystem.initializeKnowledgeLearning();
      return true;
      
    } catch (error) {
      console.error('❌ Failed to load real knowledge system, falling back to basic implementation:', error.message);
      
      // Fallback to basic implementation if real system fails
      const basicSystem = {
        initializeKnowledgeLearning: () => Promise.resolve(true),
        searchKnowledge: (query) => Promise.resolve({ results: [], message: `Basic search for: ${query}` }),
        generateKnowledgeSummary: () => Promise.resolve({ summary: 'Basic knowledge system active' }),
        getKnowledgeGraph: () => Promise.resolve({ nodes: [], edges: [] }),
        extractKeywords: (text) => text.split(' ').filter(word => word.length > 4).slice(0, 5)
      };
      
      registerSystem('knowledge-learning-system', basicSystem);
      console.warn('⚠️ Registered BASIC knowledge learning system as fallback');
      return true;
    }
  }
  return false;
}

/**
 * Get all registered systems
 * @returns {Map<string, Object>} - Map of all registered systems
 */
export function getAllSystems() {
  return registeredSystems;
}

// Export all functions
export default {
  registerSystem,
  getSystem,
  hasSystem,
  waitForSystem,
  registerStubKnowledgeSystem: registerRealKnowledgeSystem, // Use real implementation
  registerRealKnowledgeSystem,
  getAllSystems
}; 