/**
 * 🧠 Enhanced Memory Integration Layer
 * 
 * This module provides seamless integration between the enhanced memory system
 * and the existing agent infrastructure, making it easy for agents to use
 * the new memory capabilities without breaking existing code.
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { performance } from 'perf_hooks';

// Import the EnhancedMemorySystem from the local learning directory
import { EnhancedMemorySystem } from './enhanced-memory-system.js';
// Removed @elizaos/core dependency - using console for logging
import { fileURLToPath } from 'url';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global enhanced memory system instance
let enhancedMemorySystem = null;

/**
 * 🚀 Initialize the enhanced memory system
 */
export async function initializeEnhancedMemory(baseDir = './agent/data/memory') {
    try {
        if (!enhancedMemorySystem) {
            enhancedMemorySystem = new EnhancedMemorySystem(baseDir);
            console.info('🧠 Enhanced Memory System initialized successfully');
            
            // Set up event listeners for monitoring
            enhancedMemorySystem.eventEmitter.on('memoryStored', (memory) => {
                console.debug(`📝 Memory stored: ${memory.id?.substring(0, 8)} (${memory.memoryType})`);
            });
            
            enhancedMemorySystem.eventEmitter.on('memoryScored', (event) => {
                console.debug(`📊 Memory scored: ${event.memoryId.substring(0, 8)} = ${event.score} by ${event.agentId}`);
            });
        }
        return enhancedMemorySystem;
    } catch (error) {
        console.error('Failed to initialize enhanced memory system:', error);
        throw error;
    }
}

/**
 * 📝 Store memory with enhanced intelligence
 */
export async function storeEnhancedMemory(runtime, content, roomId, metadata = {}) {
    try {
        if (!enhancedMemorySystem) {
            await initializeEnhancedMemory();
        }
        
        const agentId = runtime?.agentId || 'unknown-agent';
        
        // Prepare memory object
        const memoryData = {
            roomId: formatUuid(roomId),
            userId: agentId,
            agentId: agentId,
            content: typeof content === 'string' ? { text: content } : content,
            createdAt: Date.now(),
            
            // Enhanced metadata
            importanceScore: metadata.importance || 0.5,
            memoryType: metadata.type || 'conversation',
            topics: metadata.topics || [],
            entities: metadata.entities || [],
            confidenceLevel: metadata.confidence || 0.5
        };
        
        const enhancedMemory = await enhancedMemorySystem.storeMemory(memoryData, agentId);
        
        console.info(`📝 Enhanced memory stored: ${enhancedMemory.id?.substring(0, 8)} (${enhancedMemory.memoryType})`);
        return enhancedMemory;
        
    } catch (error) {
        console.error('Failed to store enhanced memory:', error);
        
        // Fallback to basic file storage
        return await fallbackMemoryStorage(runtime, content, roomId, metadata);
    }
}

/**
 * 🔍 Search memories with advanced capabilities
 */
export async function searchEnhancedMemories(query, options = {}) {
    try {
        if (!enhancedMemorySystem) {
            await initializeEnhancedMemory();
        }
        
        const searchQuery = {
            text: query.text || query,
            topics: query.topics,
            entities: query.entities,
            agentId: query.agentId,
            roomId: query.roomId ? formatUuid(query.roomId) : undefined,
            memoryTypes: query.types,
            timeRange: query.timeRange,
            importanceThreshold: query.minImportance || 0.3,
            limit: options.limit || 20,
            useSemanticSearch: options.semantic !== false, // Default to true
            includeRelated: options.includeRelated || false
        };
        
        const results = await enhancedMemorySystem.searchMemories(searchQuery);
        
        console.info(`🔍 Enhanced search found ${results.length} results for: "${query.text || query}"`);
        return results;
        
    } catch (error) {
        console.error('Enhanced memory search failed:', error);
        return [];
    }
}

/**
 * 📊 Score memory importance for decision making
 */
export async function scoreMemoryImportance(memoryId, agentId, score, reason) {
    try {
        if (!enhancedMemorySystem) {
            await initializeEnhancedMemory();
        }
        
        await enhancedMemorySystem.scoreMemoryImportance(
            formatUuid(memoryId),
            agentId,
            Math.max(0, Math.min(1, score)), // Clamp between 0 and 1
            reason
        );
        
        console.info(`📊 Memory ${memoryId.substring(0, 8)} scored ${score} by ${agentId}: ${reason}`);
        
    } catch (error) {
        console.error('Failed to score memory importance:', error);
    }
}

/**
 * 🎯 Get memories by importance for decision making
 */
export async function getImportantMemories(agentId, roomId, options = {}) {
    try {
        const searchQuery = {
            agentId: agentId,
            roomId: roomId ? formatUuid(roomId) : undefined,
            importanceThreshold: options.minImportance || 0.7,
            memoryTypes: options.types || ['decision', 'insight', 'learning'],
            limit: options.limit || 10
        };
        
        const results = await searchEnhancedMemories(searchQuery, { semantic: false });
        
        // Sort by importance score
        return results
            .sort((a, b) => b.memory.importanceScore - a.memory.importanceScore)
            .map(result => result.memory);
            
    } catch (error) {
        console.error('Failed to get important memories:', error);
        return [];
    }
}

/**
 * 🏷️ Get memories by topic
 */
export async function getMemoriesByTopic(topics, roomId, options = {}) {
    try {
        const searchQuery = {
            topics: Array.isArray(topics) ? topics : [topics],
            roomId: roomId ? formatUuid(roomId) : undefined,
            limit: options.limit || 20
        };
        
        const results = await searchEnhancedMemories(searchQuery, options);
        return results.map(result => result.memory);
        
    } catch (error) {
        console.error('Failed to get memories by topic:', error);
        return [];
    }
}

/**
 * 🎯 Get memories by entity (people, places, concepts)
 */
export async function getMemoriesByEntity(entities, roomId, options = {}) {
    try {
        const searchQuery = {
            entities: Array.isArray(entities) ? entities : [entities],
            roomId: roomId ? formatUuid(roomId) : undefined,
            limit: options.limit || 20
        };
        
        const results = await searchEnhancedMemories(searchQuery, options);
        return results.map(result => result.memory);
        
    } catch (error) {
        console.error('Failed to get memories by entity:', error);
        return [];
    }
}

/**
 * ⏰ Get recent memories with time filtering
 */
export async function getRecentMemories(agentId, roomId, timeRange, options = {}) {
    try {
        const searchQuery = {
            agentId: agentId,
            roomId: roomId ? formatUuid(roomId) : undefined,
            timeRange: timeRange,
            limit: options.limit || 20
        };
        
        const results = await searchEnhancedMemories(searchQuery, options);
        return results.map(result => result.memory);
        
    } catch (error) {
        console.error('Failed to get recent memories:', error);
        return [];
    }
}

/**
 * 🧠 Get semantic memories (similar content)
 */
export async function getSemanticMemories(text, roomId, options = {}) {
    try {
        const searchQuery = {
            text: text,
            roomId: roomId ? formatUuid(roomId) : undefined,
            limit: options.limit || 10
        };
        
        const results = await searchEnhancedMemories(searchQuery, { 
            semantic: true,
            ...options 
        });
        
        return results.map(result => ({
            memory: result.memory,
            similarity: result.relevanceScore,
            explanation: result.explanation
        }));
        
    } catch (error) {
        console.error('Failed to get semantic memories:', error);
        return [];
    }
}

/**
 * 📈 Get memory statistics and insights
 */
export async function getMemoryStats() {
    try {
        if (!enhancedMemorySystem) {
            await initializeEnhancedMemory();
        }
        
        const stats = await enhancedMemorySystem.getMemoryStats();
        
        console.info(`📈 Memory Stats: ${stats.totalMemories} memories, ${(stats.cacheHitRate * 100).toFixed(1)}% cache hit rate`);
        return stats;
        
    } catch (error) {
        console.error('Failed to get memory stats:', error);
        return {
            totalMemories: 0,
            cacheHitRate: 0,
            averageImportance: 0,
            topTopics: [],
            topEntities: [],
            compressionRatio: 0
        };
    }
}

/**
 * 🎯 Agent-specific memory helpers
 */
export class AgentMemoryHelper {
    constructor(agentId, roomId) {
        this.agentId = agentId;
        this.roomId = roomId;
    }
    
    /**
     * Store memory with agent context
     */
    async store(content, metadata = {}) {
        return await storeEnhancedMemory(
            { agentId: this.agentId },
            content,
            this.roomId,
            {
                ...metadata,
                sourceAgent: this.agentId
            }
        );
    }
    
    /**
     * Search memories in agent's context
     */
    async search(query, options = {}) {
        const searchQuery = typeof query === 'string' ? { text: query } : query;
        searchQuery.agentId = this.agentId;
        searchQuery.roomId = this.roomId;
        
        return await searchEnhancedMemories(searchQuery, options);
    }
    
    /**
     * Score memory importance from agent's perspective
     */
    async scoreImportance(memoryId, score, reason) {
        return await scoreMemoryImportance(memoryId, this.agentId, score, reason);
    }
    
    /**
     * Get agent's most important memories
     */
    async getImportantMemories(options = {}) {
        return await getImportantMemories(this.agentId, this.roomId, options);
    }
    
    /**
     * Get memories related to specific topics
     */
    async getTopicMemories(topics, options = {}) {
        return await getMemoriesByTopic(topics, this.roomId, options);
    }
    
    /**
     * Get memories about specific entities
     */
    async getEntityMemories(entities, options = {}) {
        return await getMemoriesByEntity(entities, this.roomId, options);
    }
    
    /**
     * Get recent memories in time range
     */
    async getRecentMemories(timeRange, options = {}) {
        return await getRecentMemories(this.agentId, this.roomId, timeRange, options);
    }
    
    /**
     * Find semantically similar memories
     */
    async getSimilarMemories(text, options = {}) {
        return await getSemanticMemories(text, this.roomId, options);
    }
    
    /**
     * Store learning memory with high importance
     */
    async storeLearning(content, topics = [], entities = []) {
        return await this.store(content, {
            type: 'learning',
            importance: 0.8,
            topics: topics,
            entities: entities,
            confidence: 0.9
        });
    }
    
    /**
     * Store decision memory for future reference
     */
    async storeDecision(content, reasoning, outcome = null) {
        return await this.store(content, {
            type: 'decision',
            importance: 0.9,
            topics: ['decision', 'reasoning'],
            entities: [this.agentId],
            confidence: 0.8,
            metadata: {
                reasoning: reasoning,
                outcome: outcome
            }
        });
    }
    
    /**
     * Store insight with high importance
     */
    async storeInsight(content, topics = [], confidence = 0.8) {
        return await this.store(content, {
            type: 'insight',
            importance: 0.85,
            topics: ['insight', ...topics],
            entities: [this.agentId],
            confidence: confidence
        });
    }
    
    /**
     * Store error for learning purposes
     */
    async storeError(error, context = {}) {
        return await this.store({
            text: `Error: ${error.message}`,
            error: error.stack,
            context: context
        }, {
            type: 'error',
            importance: 0.7,
            topics: ['error', 'debugging'],
            entities: [this.agentId],
            confidence: 1.0
        });
    }
    
    /**
     * Store success for pattern recognition
     */
    async storeSuccess(content, metrics = {}) {
        return await this.store({
            text: content,
            metrics: metrics
        }, {
            type: 'success',
            importance: 0.75,
            topics: ['success', 'achievement'],
            entities: [this.agentId],
            confidence: 0.9
        });
    }
}

/**
 * 🔧 Utility functions
 */

// Helper for UUID formatting
function formatUuid(string) {
    if (!string) return null;
    const cleaned = string.replace(/-/g, '');
    if (cleaned.length !== 32) return string;
    return `${cleaned.substring(0, 8)}-${cleaned.substring(8, 12)}-${cleaned.substring(12, 16)}-${cleaned.substring(16, 20)}-${cleaned.substring(20)}`;
}

// Fallback memory storage for compatibility
async function fallbackMemoryStorage(runtime, content, roomId, metadata) {
    try {
        const memoryId = crypto.randomUUID();
        const formattedRoomId = formatUuid(roomId);
        const agentId = runtime?.agentId || 'unknown-agent';
        
        const memory = {
            id: memoryId,
            roomId: formattedRoomId,
            room_id: formattedRoomId,
            userId: agentId,
            user_id: agentId,
            agentId: agentId,
            agent_id: agentId,
            content: typeof content === 'string' ? { text: content } : content,
            createdAt: Date.now(),
            created_at: Date.now(),
            metadata: metadata
        };
        
        // Store to file system as fallback
        const storageDir = path.join(__dirname, '..', 'data', 'memory-fallback');
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }
        
        const filePath = path.join(storageDir, `room-${formattedRoomId}.json`);
        let memories = [];
        
        if (fs.existsSync(filePath)) {
            try {
                memories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (error) {
                console.warn('Failed to read existing memories:', error);
            }
        }
        
        memories.push(memory);
        fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));
        
        console.info(`💾 Fallback memory stored: ${memoryId.substring(0, 8)}`);
        return memory;
        
    } catch (error) {
        console.error('Fallback memory storage failed:', error);
        throw error;
    }
}

/**
 * 🎯 Convenience functions for common use cases
 */

// Quick memory storage for agents
export async function quickStore(runtime, text, importance = 0.5) {
    return await storeEnhancedMemory(runtime, text, runtime.roomId || 'default', {
        importance: importance,
        type: 'conversation'
    });
}

// Quick search for agents
export async function quickSearch(text, roomId, limit = 10) {
    const results = await searchEnhancedMemories({ text: text, roomId: roomId }, { limit: limit });
    return results.map(r => r.memory);
}

// Get agent's memory helper
export function getMemoryHelper(agentId, roomId) {
    return new AgentMemoryHelper(agentId, roomId);
}

// Initialize enhanced memory for an agent
export async function initializeAgentMemory(agentId, roomId) {
    await initializeEnhancedMemory();
    return new AgentMemoryHelper(agentId, roomId);
}

/**
 * 🔄 Migration helpers for existing memories
 */
export async function migrateExistingMemories(sourceDir = './agent/data/memory-storage') {
    try {
        if (!enhancedMemorySystem) {
            await initializeEnhancedMemory();
        }
        
        console.info('🔄 Starting memory migration...');
        
        let migratedCount = 0;
        const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));
        
        for (const file of files) {
            try {
                const filePath = path.join(sourceDir, file);
                const memories = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                for (const memory of memories) {
                    if (memory.id && memory.content) {
                        await enhancedMemorySystem.storeMemory({
                            id: memory.id,
                            roomId: memory.roomId || memory.room_id,
                            userId: memory.userId || memory.user_id,
                            agentId: memory.agentId || memory.agent_id,
                            content: memory.content,
                            createdAt: memory.createdAt || memory.created_at || Date.now()
                        }, memory.agentId || memory.agent_id || 'migrated');
                        
                        migratedCount++;
                    }
                }
            } catch (error) {
                console.warn(`Failed to migrate file ${file}:`, error);
            }
        }
        
        console.info(`✅ Migration completed: ${migratedCount} memories migrated`);
        return migratedCount;
        
    } catch (error) {
        console.error('Memory migration failed:', error);
        return 0;
    }
}

// Export the enhanced memory system instance for direct access
export { enhancedMemorySystem };

// Default export for convenience
export default {
    initialize: initializeEnhancedMemory,
    store: storeEnhancedMemory,
    search: searchEnhancedMemories,
    score: scoreMemoryImportance,
    getImportant: getImportantMemories,
    getByTopic: getMemoriesByTopic,
    getByEntity: getMemoriesByEntity,
    getRecent: getRecentMemories,
    getSemantic: getSemanticMemories,
    getStats: getMemoryStats,
    getHelper: getMemoryHelper,
    quickStore: quickStore,
    quickSearch: quickSearch,
    migrate: migrateExistingMemories,
    AgentMemoryHelper
}; 