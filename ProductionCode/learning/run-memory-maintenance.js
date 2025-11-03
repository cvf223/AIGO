/**
 * Memory Maintenance Runner
 */
import { initializeMemoryConsolidation } from './src/enhanced-memory-system.js';
import knowledgeSystem from './src/knowledge-learning-system.js';

console.log(`[${new Date().toISOString()}] Starting memory maintenance system`);

// Initialize memory consolidation
initializeMemoryConsolidation();

// Initialize knowledge learning
knowledgeSystem.initializeKnowledgeLearning();

console.log(`[${new Date().toISOString()}] Memory maintenance system initialized`);

// Keep process running
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Memory maintenance system running`);
}, 1000 * 60 * 60); // Log status every hour
