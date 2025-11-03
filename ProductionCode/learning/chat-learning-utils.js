/**
 * Chat Learning Utilities
 * 
 * Provides functions for extracting knowledge from chat interactions
 * and integrating it with the agent's knowledge base.
 */

// Removed @elizaos/core dependency - using console for logging

// Import knowledge system
import knowledgeSystem from './knowledge-learning-system.js';

/**
 * Process a new message to extract knowledge
 * @param {Object} message - The message to process
 * @param {Object} runtime - The agent runtime
 * @returns {Promise<Object>} - Results of the knowledge extraction
 */
export async function learnFromMessage(message, runtime) {
  try {
    if (!message || !message.content) {
      return { success: false, reason: 'Invalid message' };
    }
    
    const roomId = message.roomId || message.room_id;
    const agentId = runtime.agentId;
    
    if (!roomId || !agentId) {
      return { success: false, reason: 'Missing roomId or agentId' };
    }
    
    // Create a temporary memory to extract knowledge from
    const tempMemory = {
      id: `temp-${Date.now()}`,
      content: message.content,
      roomId,
      agentId,
      createdAt: Date.now()
    };
    
    // Extract concepts from the message
    const extractions = await knowledgeSystem.extractConceptsFromMemory(tempMemory);
    
    if (!extractions || extractions.length === 0) {
      return { success: true, extracted: 0, message: 'No concepts extracted' };
    }
    
    // Track learning statistics
    const stats = {
      extracted: extractions.length,
      created: 0,
      updated: 0,
      linked: 0
    };
    
    // Process each extraction
    for (const extraction of extractions) {
      const concept = await knowledgeSystem.createConceptFromExtraction(extraction, agentId);
      
      if (concept) {
        if (concept.metadata.version === 1) {
          stats.created++;
        } else {
          stats.updated++;
        }
        
        // Find and create links to related concepts
        const relatedConcepts = await knowledgeSystem.findRelatedConcepts(concept.id);
        
        for (const related of relatedConcepts) {
          await knowledgeSystem.createKnowledgeLink(
            concept.id,
            related.conceptId,
            related.relationship,
            related.similarity,
            { source_message: message.id || tempMemory.id }
          );
          stats.linked++;
        }
      }
    }
    
    return {
      success: true,
      stats,
      message: `Learned ${stats.created} new concepts, updated ${stats.updated}, linked ${stats.linked}`
    };
  } catch (error) {
    console.error(`Failed to learn from message: ${error.message}`);
    return {
      success: false,
      reason: error.message
    };
  }
}

/**
 * Helper function to prioritize important concepts
 * @param {Array} concepts - List of concepts to prioritize
 * @param {Object} options - Options for prioritization
 * @returns {Array} - Prioritized concepts
 */
export function prioritizeConcepts(concepts, options = {}) {
  if (!concepts || !Array.isArray(concepts)) {
    return [];
  }
  
  const { limit = 10, minImportance = 0.0 } = options;
  
  // Filter by minimum importance
  const filtered = concepts.filter(c => {
    const importance = c.importance || c.metadata?.importance || 0;
    return importance >= minImportance;
  });
  
  // Sort by importance (descending)
  const sorted = filtered.sort((a, b) => {
    const importanceA = a.importance || a.metadata?.importance || 0;
    const importanceB = b.importance || b.metadata?.importance || 0;
    return importanceB - importanceA;
  });
  
  // Apply limit
  return sorted.slice(0, limit);
}

/**
 * Helper function to extract common themes from a set of memories
 * @param {Array} memories - Memories to analyze
 * @returns {Object} - Common themes, topics, and entities
 */
export async function extractCommonThemes(memories) {
  if (!memories || !Array.isArray(memories) || memories.length === 0) {
    return { themes: [], topics: [], entities: [] };
  }
  
  // Get text content from memories
  const texts = memories.map(memory => {
    if (typeof memory.content === 'string') {
      return memory.content;
    }
    return memory.content?.text || JSON.stringify(memory.content || {});
  }).filter(text => text && text.length > 0);
  
  if (texts.length === 0) {
    return { themes: [], topics: [], entities: [] };
  }
  
  // Extract keywords from each text
  const allKeywords = [];
  for (const text of texts) {
    const keywords = knowledgeSystem.extractKeywords(text);
    allKeywords.push(...keywords);
  }
  
  // Count frequency of keywords
  const keywordFrequency = {};
  for (const keyword of allKeywords) {
    keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1;
  }
  
  // Get top keywords by frequency
  const topKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([keyword, count]) => ({
      keyword,
      count,
      frequency: count / texts.length
    }));
  
  // Extract themes (keywords that appear in at least 25% of texts)
  const themes = topKeywords
    .filter(k => k.frequency >= 0.25)
    .slice(0, 5)
    .map(k => k.keyword);
  
  // Extract topics (top 10 keywords)
  const topics = topKeywords
    .slice(0, 10)
    .map(k => k.keyword);
  
  // For simplicity, we're not doing true entity extraction
  // In a real implementation, you would use NLP for proper entity extraction
  const entities = [];
  
  return {
    themes,
    topics,
    entities
  };
}

/**
 * Get agents' shared knowledge on a specific topic
 * @param {string} topic - Topic to retrieve knowledge about
 * @param {Object} runtime - The agent runtime
 * @returns {Promise<Object>} - Relevant knowledge
 */
export async function getSharedKnowledgeOnTopic(topic, runtime) {
  try {
    // Search for knowledge related to the topic
    const knowledgeResults = await runtime.searchKnowledge(topic, { limit: 10 });
    
    // Get messages from the group related to the topic
    const groupMemories = await runtime.readFromMastermindGroup(20);
    const relevantMemories = groupMemories.filter(memory => {
      const text = typeof memory.content === 'string' 
        ? memory.content 
        : memory.content?.text || '';
      
      return text.toLowerCase().includes(topic.toLowerCase());
    });
    
    // Extract common themes from relevant memories
    const themes = await extractCommonThemes(relevantMemories);
    
    return {
      topic,
      knowledge: knowledgeResults,
      messages: relevantMemories.map(m => ({
        id: m.id,
        agentId: m.agentId,
        content: m.content,
        createdAt: m.createdAt || m.created_at
      })),
      themes
    };
  } catch (error) {
    console.error(`Failed to get shared knowledge on topic ${topic}: ${error.message}`);
    return {
      topic,
      knowledge: [],
      messages: [],
      themes: { themes: [], topics: [], entities: [] },
      error: error.message
    };
  }
}

// Export all functions
export default {
  learnFromMessage,
  prioritizeConcepts,
  extractCommonThemes,
  getSharedKnowledgeOnTopic
}; 