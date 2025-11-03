/**
 * Enhanced Memory System
 * 
 * A complete file-based memory system replacement for Supabase
 * Handles all memory operations using local file storage
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
// Removed @elizaos/core dependency - using console for logging
import lockfile from 'proper-lockfile';
import { createClient } from '@supabase/supabase-js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage paths
const STORAGE_PATHS = {
  // Primary storage
  main: path.join(__dirname, '..', 'data', 'memory-storage'),
  // Long-term storage
  longTerm: path.join(__dirname, '..', 'data', 'memory', 'long_term'),
  // Short-term storage
  shortTerm: path.join(__dirname, '..', 'data', 'memory', 'short_term'),
  // Shared memory between agents
  shared: path.join(__dirname, '..', 'data', 'shared-memory'),
  // Backup storage
  backup: path.join(__dirname, '..', 'data', 'memory-backups'),
  // Fallback storage
  fallback: path.join(__dirname, '..', 'data', 'memory-fallback')
};

// Ensure all storage directories exist
Object.values(STORAGE_PATHS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created memory directory: ${dir}`);
  }
});

/**
 * Format UUID with proper dashes if needed
 * @param {string} id - UUID string
 * @returns {string} Formatted UUID
 */
function formatUuid(id) {
  if (!id) return null;
  const cleaned = id.replace(/-/g, '');
  if (cleaned.length !== 32) return id;
  return `${cleaned.substring(0, 8)}-${cleaned.substring(8, 12)}-${cleaned.substring(12, 16)}-${cleaned.substring(16, 20)}-${cleaned.substring(20)}`;
}

/**
 * Get file path for memory storage
 * @param {string} roomId - Room ID
 * @param {string} type - Memory type (main, shortTerm, longTerm, shared)
 * @returns {string} File path
 */
function getMemoryFilePath(roomId, type = 'main') {
  const formattedRoomId = formatUuid(roomId);
  const basePath = STORAGE_PATHS[type] || STORAGE_PATHS.main;
  return path.join(basePath, `room-${formattedRoomId}.json`);
}

/**
 * Read memories from file
 * @param {string} filePath - Path to memory file
 * @returns {Array} Array of memories
 */
async function readMemoriesFromFile(filePath) {
  let release;
  try {
    if (fs.existsSync(filePath)) {
      release = await lockfile.lock(filePath, { retries: 3, stale: 5000 });
      const rawData = fs.readFileSync(filePath, 'utf8');
      if (release) await release();
      return JSON.parse(rawData);
    }
  } catch (err) {
    if (release) await release();
    console.error(`Error reading memory file ${filePath}:`, err);
  }
  return [];
}

/**
 * Write memories to file
 * @param {string} filePath - Path to memory file
 * @param {Array} memories - Array of memory objects
 * @returns {boolean} Success status
 */
async function writeMemoriesToFile(filePath, memories) {
  let release;
  try {
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    // Create a backup before writing
    if (fs.existsSync(filePath)) {
      const backupDir = STORAGE_PATHS.backup;
      const backupFile = path.join(backupDir, `${path.basename(filePath)}.${Date.now()}.bak`);
      fs.copyFileSync(filePath, backupFile);
    }
    release = await lockfile.lock(filePath, { retries: 3, stale: 5000 });
    // Write atomically by using a temp file first
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(memories, null, 2));
    fs.renameSync(tempPath, filePath);
    if (release) await release();
    return true;
  } catch (err) {
    if (release) await release();
    console.error(`Error writing memory file ${filePath}:`, err);
    return false;
  }
}

/**
 * Create a new memory
 * @param {string} roomId - Room ID 
 * @param {string} agentId - Agent ID
 * @param {Object|string} content - Memory content
 * @param {Object} metadata - Additional metadata
 * @returns {Object} Created memory object
 */
export async function createMemory(roomId, agentId, content, metadata = {}) {
  try {
    // Generate UUID for the memory
    const memoryId = formatUuid(crypto.randomUUID());
    const formattedRoomId = formatUuid(roomId);
    
    // Create memory object
    const memory = {
      id: memoryId,
      roomId: formattedRoomId,
      room_id: formattedRoomId, // Include both formats for compatibility
      agentId: agentId,
      agent_id: agentId, // Include both formats for compatibility
      userId: agentId,
      user_id: agentId,
      content: typeof content === 'string' 
        ? { text: content } 
        : content,
      createdAt: Date.now(),
      created_at: Date.now(),
      type: 'message',
      metadata: metadata || {}
    };
    
    // Store in main memory
    const mainFilePath = getMemoryFilePath(formattedRoomId, 'main');
    const memories = await readMemoriesFromFile(mainFilePath);
    memories.push(memory);
    await writeMemoriesToFile(mainFilePath, memories);
    
    // Also store in short-term memory
    const shortTermPath = getMemoryFilePath(formattedRoomId, 'shortTerm');
    const shortTermMemories = await readMemoriesFromFile(shortTermPath);
    shortTermMemories.push(memory);
    await writeMemoriesToFile(shortTermPath, shortTermMemories);
    
    // If it's a shared room, also store in shared memory
    if (formattedRoomId !== agentId) {
      const sharedPath = getMemoryFilePath(formattedRoomId, 'shared');
      const sharedMemories = await readMemoriesFromFile(sharedPath);
      sharedMemories.push(memory);
      await writeMemoriesToFile(sharedPath, sharedMemories);
    }
    
    console.log(`Memory created: ${memoryId.substring(0, 8)}... in room ${formattedRoomId.substring(0, 8)}...`);
    return memory;
  } catch (error) {
    console.error('Error creating memory:', error);
    throw error;
  }
}

/**
 * Get memories for a room
 * @param {string} roomId - Room ID
 * @param {Object} options - Options object
 * @param {number} options.limit - Maximum number of memories to retrieve
 * @param {boolean} options.includeShortTerm - Include short-term memories
 * @param {boolean} options.includeLongTerm - Include long-term memories
 * @returns {Array} Array of memories
 */
export async function getMemories(roomId, options = {}) {
  const formattedRoomId = formatUuid(roomId);
  const limit = options.limit || 100;
  let memories = [];
  
  try {
    // Get main memories
    const mainFilePath = getMemoryFilePath(formattedRoomId, 'main');
    const mainMemories = await readMemoriesFromFile(mainFilePath);
    memories = [...mainMemories];
    
    // Get short-term memories if requested
    if (options.includeShortTerm !== false) {
      const shortTermPath = getMemoryFilePath(formattedRoomId, 'shortTerm');
      const shortTermMemories = await readMemoriesFromFile(shortTermPath);
      memories = [...memories, ...shortTermMemories.filter(m => 
        !memories.some(existing => existing.id === m.id)
      )];
    }
    
    // Get long-term memories if requested
    if (options.includeLongTerm !== false) {
      const longTermPath = getMemoryFilePath(formattedRoomId, 'longTerm');
      const longTermMemories = await readMemoriesFromFile(longTermPath);
      memories = [...memories, ...longTermMemories.filter(m => 
        !memories.some(existing => existing.id === m.id)
      )];
    }
    
    // Sort by timestamp (newest first) and limit
    memories.sort((a, b) => {
      const timeA = a.createdAt || a.created_at || 0;
      const timeB = b.createdAt || b.created_at || 0;
      return timeB - timeA;
    });
    
    return memories.slice(0, limit);
  } catch (error) {
    console.error(`Error getting memories for room ${formattedRoomId}:`, error);
    return [];
  }
}

/**
 * Get memory by ID
 * @param {string} memoryId - Memory ID
 * @returns {Object|null} Memory object or null if not found
 */
export async function getMemoryById(memoryId) {
  try {
    // Search in all memory directories
    const memoryTypes = ['main', 'shortTerm', 'longTerm', 'shared'];
    
    for (const type of memoryTypes) {
      const directory = STORAGE_PATHS[type];
      const files = fs.readdirSync(directory);
      
      for (const file of files) {
        if (file.startsWith('room-') && file.endsWith('.json')) {
          const memories = await readMemoriesFromFile(path.join(directory, file));
          const memory = memories.find(m => m.id === memoryId);
          
          if (memory) {
            return memory;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting memory by ID ${memoryId}:`, error);
    return null;
  }
}

/**
 * Delete memory by ID
 * @param {string} memoryId - Memory ID
 * @returns {boolean} Success status
 */
export async function deleteMemory(memoryId) {
  try {
    let deleted = false;
    const memoryTypes = ['main', 'shortTerm', 'longTerm', 'shared'];
    
    for (const type of memoryTypes) {
      const directory = STORAGE_PATHS[type];
      const files = fs.readdirSync(directory);
      
      for (const file of files) {
        if (file.startsWith('room-') && file.endsWith('.json')) {
          const filePath = path.join(directory, file);
          const memories = await readMemoriesFromFile(filePath);
          
          const filteredMemories = memories.filter(m => m.id !== memoryId);
          
          if (memories.length !== filteredMemories.length) {
            await writeMemoriesToFile(filePath, filteredMemories);
            deleted = true;
          }
        }
      }
    }
    
    return deleted;
  } catch (error) {
    console.error(`Error deleting memory ${memoryId}:`, error);
    return false;
  }
}

/**
 * Initialize memory system
 */
export function initializeMemorySystem() {
  // Ensure all directories exist
  Object.values(STORAGE_PATHS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('Memory system initialized with file-based storage');
  return true;
}

/**
 * Consolidate memories (move short-term to long-term)
 * @param {string} roomId - Room ID
 * @param {Object} options - Options object
 * @returns {boolean} Success status
 */
export async function consolidateMemories(roomId, options = {}) {
  const formattedRoomId = formatUuid(roomId);
  const shortTermPath = getMemoryFilePath(formattedRoomId, 'shortTerm');
  const longTermPath = getMemoryFilePath(formattedRoomId, 'longTerm');
  
  try {
    // Get short-term memories
    const shortTermMemories = await readMemoriesFromFile(shortTermPath);
    
    // Get existing long-term memories
    const longTermMemories = await readMemoriesFromFile(longTermPath);
    
    // Determine memories to consolidate (older than 24 hours)
    const now = Date.now();
    const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago
    
    const memoriesToMove = shortTermMemories.filter(memory => {
      const timestamp = memory.createdAt || memory.created_at || 0;
      return timestamp < cutoff;
    });
    
    // Move memories to long-term storage
    const updatedLongTerm = [...longTermMemories, ...memoriesToMove];
    await writeMemoriesToFile(longTermPath, updatedLongTerm);
    
    // Remove consolidated memories from short-term
    const updatedShortTerm = shortTermMemories.filter(memory => {
      const timestamp = memory.createdAt || memory.created_at || 0;
      return timestamp >= cutoff;
    });
    await writeMemoriesToFile(shortTermPath, updatedShortTerm);
    
    console.log(`Consolidated ${memoriesToMove.length} memories for room ${formattedRoomId.substring(0, 8)}...`);
    return true;
  } catch (error) {
    console.error(`Error consolidating memories for room ${formattedRoomId}:`, error);
    return false;
  }
}

/**
 * Initialize memory consolidation job
 * @returns {Object} Timer object
 */
export function initializeMemoryConsolidation() {
  // Run memory consolidation once every 12 hours
  const consolidationInterval = 12 * 60 * 60 * 1000; // 12 hours
  
  const timer = setInterval(() => {
    console.log('Running memory consolidation...');
    
    try {
      // Get all room files
      const files = fs.readdirSync(STORAGE_PATHS.main);
      
      for (const file of files) {
        if (file.startsWith('room-') && file.endsWith('.json')) {
          const roomId = file.replace('room-', '').replace('.json', '');
          consolidateMemories(roomId).catch(err => {
            console.error(`Error consolidating memory for room ${roomId}:`, err);
          });
        }
      }
    } catch (error) {
      console.error('Error in memory consolidation job:', error);
    }
  }, consolidationInterval);
  
  // Run once at startup
  setTimeout(() => {
    console.log('Running initial memory consolidation...');
    try {
      const files = fs.readdirSync(STORAGE_PATHS.main);
      
      for (const file of files) {
        if (file.startsWith('room-') && file.endsWith('.json')) {
          const roomId = file.replace('room-', '').replace('.json', '');
          consolidateMemories(roomId).catch(err => {
            console.error(`Error in initial consolidation for room ${roomId}:`, err);
          });
        }
      }
    } catch (error) {
      console.error('Error in initial memory consolidation:', error);
    }
  }, 10000); // Run 10 seconds after startup
  
  return timer;
}

/**
 * Memory importance score calculation
 * Determines how significant a memory is for long-term retention
 */
function calculateImportance(memory) {
  // Base importance
  let importance = 0.3;
  
  const text = getMemoryText(memory);
  
  // Length-based importance (longer content might be more significant)
  importance += Math.min(text.length / 1000, 0.3);
  
  // Keyword-based importance
  const importantKeywords = [
    "important", "critical", "remember", "key", "essential", 
    "vital", "crucial", "significant", "priority", "urgent",
    "breakthrough", "discovery", "decision", "agreement"
  ];
  
  const textLower = text.toLowerCase();
  for (const keyword of importantKeywords) {
    if (textLower.includes(keyword)) {
      importance += 0.05;
    }
  }
  
  // Consider repetition of concepts
  // (This is a simplified version - a more robust implementation would use embedding similarity)
  const wordFrequency = {};
  const words = textLower.split(/\s+/);
  for (const word of words) {
    if (word.length > 3) { // Skip small words
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      if (wordFrequency[word] > 2) {
        importance += 0.01; // Repeated concepts might be important
      }
    }
  }
  
  // Metadata-based importance
  if (memory.metadata) {
    if (memory.metadata.importance) {
      importance += memory.metadata.importance;
    }
    if (memory.metadata.isDecision) {
      importance += 0.2;
    }
  }
  
  // Cap importance at 1.0
  return Math.min(importance, 1.0);
}

/**
 * Safe extraction of memory text
 */
function getMemoryText(memory) {
  if (!memory || !memory.content) return '';
  if (typeof memory.content === 'string') return memory.content;
  return memory.content.text || memory.content.message || '';
}

/**
 * Tag a memory with keywords
 */
export async function tagMemory(memoryId, tags) {
  try {
    // Find the memory in both short and long term
    const memory = await findMemoryById(memoryId);
    
    if (!memory || !memory.filePath) {
      return false;
    }
    
    // Add tags
    memory.data.tags = [...new Set([...(memory.data.tags || []), ...tags])];
    
    // Update metadata
    memory.data.metadata = memory.data.metadata || {};
    memory.data.metadata.lastUpdated = Date.now();
    
    // Save changes
    await writeMemoriesToFile(memory.filePath, memory.data);
    
    return true;
  } catch (error) {
    console.error(`Failed to tag memory:`, error);
    return false;
  }
}

/**
 * Find a memory by ID
 */
async function findMemoryById(memoryId) {
  try {
    const formattedId = formatUuid(memoryId);
    
    // Check both short and long term directories
    const directories = [STORAGE_PATHS.shortTerm, STORAGE_PATHS.longTerm];
    
    for (const baseDir of directories) {
      if (!fs.existsSync(baseDir)) continue;
      
      // Check each room directory
      const roomDirs = fs.readdirSync(baseDir);
      
      for (const roomDir of roomDirs) {
        const fullRoomDir = path.join(baseDir, roomDir);
        if (!fs.statSync(fullRoomDir).isDirectory()) continue;
        
        // Check each memory file
        const filePath = path.join(fullRoomDir, `${formattedId}.json`);
        if (fs.existsSync(filePath)) {
          const data = await readMemoriesFromFile(filePath);
          return { data, filePath };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to find memory:`, error);
    return null;
  }
}

/**
 * Search memories by text content
 * @param {string} roomId - Room ID
 * @param {string} query - Search query
 * @param {Object} options - Options object
 * @returns {Array} Array of matching memories
 */
export async function searchMemories(roomId, query, options = {}) {
  try {
    // Get memories first
    const memories = await getMemories(roomId, options);
    
    if (!query || query.trim() === '') {
      return memories;
    }
    
    // Simple text-based search
    const normalizedQuery = query.toLowerCase();
    return memories.filter(memory => {
      const text = getMemoryText(memory).toLowerCase();
      return text.includes(normalizedQuery);
    });
  } catch (error) {
    console.error(`Error searching memories:`, error);
    return [];
  }
} 

class EnhancedMemorySystem {
  constructor() {
    this.supabase = null;
    this.fallbackMode = false;
    this.memoryCache = new Map();
    this.initializeSupabase();
    this.fallbackDir = path.join(__dirname, '../data/memory-fallback');
    this.ensureDirectories();
  }

  initializeSupabase() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_API_KEY || process.env.SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('✅ [Memory] Supabase initialized');
      } else {
        console.warn('⚠️ [Memory] Supabase credentials missing, using local storage');
        this.fallbackMode = true;
      }
    } catch (error) {
      console.warn('⚠️ [Memory] Supabase initialization failed:', error.message);
      this.fallbackMode = true;
    }
  }

  ensureDirectories() {
    const dirs = [
      this.fallbackDir,
      path.join(this.fallbackDir, 'agents'),
      path.join(this.fallbackDir, 'shared'),
      path.join(this.fallbackDir, 'rooms')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Agent Memory Management
  async saveAgentMemory(agentId, memory) {
    try {
      // Try Supabase first
      if (!this.fallbackMode && this.supabase) {
        const { error } = await this.supabase
          .from('agent_memory')
          .upsert({
            agent_id: agentId,
            memory_data: memory,
            updated_at: new Date().toISOString()
          });

        if (!error) {
          this.memoryCache.set(agentId, memory);
          return true;
        } else {
          console.warn(`⚠️ [Memory] Supabase save failed for ${agentId}, falling back to local`);
          this.fallbackMode = true;
        }
      }

      // Fallback to local storage
      const filePath = path.join(this.fallbackDir, 'agents', `${agentId}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(memory, null, 2));
      this.memoryCache.set(agentId, memory);
      console.log(`💾 [Memory] Saved ${agentId} memory locally`);
      return true;

    } catch (error) {
      console.error(`❌ [Memory] Failed to save memory for ${agentId}:`, error.message);
      return false;
    }
  }

  async loadAgentMemory(agentId) {
    try {
      // Check cache first
      if (this.memoryCache.has(agentId)) {
        return this.memoryCache.get(agentId);
      }

      // Try Supabase first
      if (!this.fallbackMode && this.supabase) {
        const { data, error } = await this.supabase
          .from('agent_memory')
          .select('memory_data')
          .eq('agent_id', agentId)
          .single();

        if (!error && data) {
          this.memoryCache.set(agentId, data.memory_data);
          return data.memory_data;
        }
      }

      // Fallback to local storage
      const filePath = path.join(this.fallbackDir, 'agents', `${agentId}.json`);
      if (fs.existsSync(filePath)) {
        const memory = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
        this.memoryCache.set(agentId, memory);
        return memory;
      }

      // Return default memory structure
      return this.getDefaultAgentMemory();

    } catch (error) {
      console.error(`❌ [Memory] Failed to load memory for ${agentId}:`, error.message);
      return this.getDefaultAgentMemory();
    }
  }

  // Room Memory Management
  async saveRoomMemory(roomId, messages) {
    try {
      if (!this.fallbackMode && this.supabase) {
        const { error } = await this.supabase
          .from('room_memory')
          .upsert({
            room_id: roomId,
            messages: messages,
            updated_at: new Date().toISOString()
          });

        if (!error) return true;
        this.fallbackMode = true;
      }

      // Fallback to local storage
      const filePath = path.join(this.fallbackDir, 'rooms', `${roomId}.json`);
      await fs.promises.writeFile(filePath, JSON.stringify(messages, null, 2));
      return true;

    } catch (error) {
      console.error(`❌ [Memory] Failed to save room memory for ${roomId}:`, error.message);
      return false;
    }
  }

  async loadRoomMemory(roomId) {
    try {
      if (!this.fallbackMode && this.supabase) {
        const { data, error } = await this.supabase
          .from('room_memory')
          .select('messages')
          .eq('room_id', roomId)
          .single();

        if (!error && data) return data.messages;
      }

      // Fallback to local storage
      const filePath = path.join(this.fallbackDir, 'rooms', `${roomId}.json`);
      if (fs.existsSync(filePath)) {
        return JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
      }

      return [];

    } catch (error) {
      console.error(`❌ [Memory] Failed to load room memory for ${roomId}:`, error.message);
      return [];
    }
  }

  // Shared Knowledge Management
  async saveSharedKnowledge(knowledge) {
    try {
      if (!this.fallbackMode && this.supabase) {
        const { error } = await this.supabase
          .from('shared_knowledge')
          .upsert({
            id: 'mastermind',
            knowledge_data: knowledge,
            updated_at: new Date().toISOString()
          });

        if (!error) return true;
        this.fallbackMode = true;
      }

      // Fallback to local storage
      const filePath = path.join(this.fallbackDir, 'shared', 'knowledge.json');
      await fs.promises.writeFile(filePath, JSON.stringify(knowledge, null, 2));
      return true;

    } catch (error) {
      console.error(`❌ [Memory] Failed to save shared knowledge:`, error.message);
      return false;
    }
  }

  async loadSharedKnowledge() {
    try {
      if (!this.fallbackMode && this.supabase) {
        const { data, error } = await this.supabase
          .from('shared_knowledge')
          .select('knowledge_data')
          .eq('id', 'mastermind')
          .single();

        if (!error && data) return data.knowledge_data;
      }

      // Fallback to local storage
      const filePath = path.join(this.fallbackDir, 'shared', 'knowledge.json');
      if (fs.existsSync(filePath)) {
        return JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
      }

      return this.getDefaultSharedKnowledge();

    } catch (error) {
      console.error(`❌ [Memory] Failed to load shared knowledge:`, error.message);
      return this.getDefaultSharedKnowledge();
    }
  }

  // Memory Utility Functions
  getDefaultAgentMemory() {
    return {
      agentId: null,
      persona: "",
      mainGoal: "",
      subGoals: [],
      tasks: [],
      selfDiscoveredTasks: [],
      keyTakeaways: [],
      discoveries: [],
      personalKnowledgeBase: [],
      notToDoList: [],
      successes: [],
      failures: [],
      interactions: [],
      resources: [],
      favoriteProtocols: [],
      recentActions: [],
      reasoningHistory: [],
      riskMode: "conservative",
      collaborations: [],
      feedback: [],
      conversationHistory: [],
      reviewedKeyTakeaways: [],
      lastReview: null,
      customNotes: [],
      predictions: [],
      predictionReviews: []
    };
  }

  getDefaultSharedKnowledge() {
    return {
      groupGoals: [],
      recentDiscoveries: [],
      groupKeyTakeaways: [],
      sharedResources: [],
      notToDoList: [],
      bestPractices: [],
      groupLearnings: [],
      emergentStrategies: [],
      crossAgentInsights: [],
      systemMetrics: {
        totalProfits: 0,
        successRate: 0,
        activeOpportunities: 0
      }
    };
  }

  // Agent Learning Functions
  async addAgentLearning(agentId, lesson, context, proof) {
    const memory = await this.loadAgentMemory(agentId);
    
    memory.keyTakeaways.push({
      timestamp: new Date().toISOString(),
      lesson,
      context,
      proof,
      validated: false
    });

    // Keep only last 50 key takeaways
    if (memory.keyTakeaways.length > 50) {
      memory.keyTakeaways = memory.keyTakeaways.slice(-50);
    }

    await this.saveAgentMemory(agentId, memory);
  }

  async addAgentDiscovery(agentId, discovery, impact, validation) {
    const memory = await this.loadAgentMemory(agentId);
    
    memory.discoveries.push({
      timestamp: new Date().toISOString(),
      discovery,
      impact,
      validation,
      shareWithGroup: impact === 'high'
    });

    await this.saveAgentMemory(agentId, memory);

    // Share high-impact discoveries with group
    if (impact === 'high') {
      const sharedKnowledge = await this.loadSharedKnowledge();
      sharedKnowledge.recentDiscoveries.push({
        agent: agentId,
        timestamp: new Date().toISOString(),
        discovery,
        validation
      });
      await this.saveSharedKnowledge(sharedKnowledge);
    }
  }

  // Arbitrage-specific memory functions
  async recordArbitrageOpportunity(agentId, opportunity) {
    const memory = await this.loadAgentMemory(agentId);
    
    if (!memory.arbitrageHistory) memory.arbitrageHistory = [];
    
    memory.arbitrageHistory.push({
      timestamp: new Date().toISOString(),
      ...opportunity
    });

    // Keep only last 100 opportunities
    if (memory.arbitrageHistory.length > 100) {
      memory.arbitrageHistory = memory.arbitrageHistory.slice(-100);
    }

    await this.saveAgentMemory(agentId, memory);
  }

  async getAgentPerformanceMetrics(agentId) {
    const memory = await this.loadAgentMemory(agentId);
    
    const metrics = {
      totalOpportunities: memory.arbitrageHistory?.length || 0,
      successfulTrades: memory.successes?.length || 0,
      failedTrades: memory.failures?.length || 0,
      totalProfit: 0,
      averageProfit: 0,
      successRate: 0
    };

    if (memory.arbitrageHistory) {
      metrics.totalProfit = memory.arbitrageHistory
        .filter(op => op.executed && op.profit)
        .reduce((sum, op) => sum + op.profit, 0);
      
      metrics.averageProfit = metrics.totalOpportunities > 0 
        ? metrics.totalProfit / metrics.totalOpportunities 
        : 0;
      
      metrics.successRate = metrics.totalOpportunities > 0 
        ? (metrics.successfulTrades / metrics.totalOpportunities) * 100 
        : 0;
    }

    return metrics;
  }

  // Health check and recovery
  async healthCheck() {
    try {
      if (!this.fallbackMode && this.supabase) {
        const { data, error } = await this.supabase
          .from('agent_memory')
          .select('count')
          .limit(1);

        if (error) {
          console.warn('⚠️ [Memory] Supabase health check failed, switching to fallback');
          this.fallbackMode = true;
          return false;
        }
      }
      
      // Check local storage
      const fallbackExists = fs.existsSync(this.fallbackDir);
      if (!fallbackExists) {
        this.ensureDirectories();
      }

      return true;
    } catch (error) {
      console.error('❌ [Memory] Health check failed:', error.message);
      return false;
    }
  }

  // Cleanup and maintenance
  async cleanup() {
    try {
      // Clear old cache entries
      this.memoryCache.clear();
      
      // Clean up old fallback files (older than 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      const agentsDir = path.join(this.fallbackDir, 'agents');
      if (fs.existsSync(agentsDir)) {
        const files = await fs.promises.readdir(agentsDir);
        
        for (const file of files) {
          const filePath = path.join(agentsDir, file);
          const stat = await fs.promises.stat(filePath);
          
          if (stat.mtime.getTime() < thirtyDaysAgo) {
            await fs.promises.unlink(filePath);
            console.log(`🧹 [Memory] Cleaned up old memory file: ${file}`);
          }
        }
      }

      console.log('✅ [Memory] Cleanup completed');
    } catch (error) {
      console.error('❌ [Memory] Cleanup failed:', error.message);
    }
  }
}

// Export singleton instance and class
export { EnhancedMemorySystem };
export const memorySystem = new EnhancedMemorySystem();
export default memorySystem; 