import { MemoryManager } from "./memory";
import { RAGKnowledgeManager } from "./ragknowledge";
import type { IMemoryManager, IRAGKnowledgeManager, IDatabaseAdapter, Character, ModelProviderName, UUID, Service, ServiceType, Plugin, Provider, Action, Evaluator, ICacheManager } from "./types";

export class MemoryLearningLogic {
  public messageManager: IMemoryManager;
  public descriptionManager: IMemoryManager;
  public loreManager: IMemoryManager;
  public documentsManager: IMemoryManager;
  public knowledgeManager: IMemoryManager;
  public ragKnowledgeManager: IRAGKnowledgeManager;
  public memoryManagers: Map<string, IMemoryManager> = new Map();

  constructor(runtime: any, knowledgeRoot: string) {
    this.messageManager = new MemoryManager({ runtime, tableName: "messages" });
    this.descriptionManager = new MemoryManager({ runtime, tableName: "descriptions" });
    this.loreManager = new MemoryManager({ runtime, tableName: "lore" });
    this.documentsManager = new MemoryManager({ runtime, tableName: "documents" });
    this.knowledgeManager = new MemoryManager({ runtime, tableName: "fragments" });
    this.ragKnowledgeManager = new RAGKnowledgeManager({ runtime, tableName: "knowledge", knowledgeRoot });
    this.memoryManagers.set("messages", this.messageManager);
    this.memoryManagers.set("descriptions", this.descriptionManager);
    this.memoryManagers.set("lore", this.loreManager);
    this.memoryManagers.set("documents", this.documentsManager);
    this.memoryManagers.set("fragments", this.knowledgeManager);
  }

  registerMemoryManager(manager: IMemoryManager): void {
    if (!manager.tableName) throw new Error("Memory manager must have a tableName");
    if (this.memoryManagers.has(manager.tableName)) return;
    this.memoryManagers.set(manager.tableName, manager);
  }

  getMemoryManager(tableName: string): IMemoryManager | null {
    return this.memoryManagers.get(tableName) || null;
  }

  // === Passthroughs for RAGKnowledgeManager ===
  async cleanupDeletedKnowledgeFiles() {
    if (typeof this.ragKnowledgeManager.cleanupDeletedKnowledgeFiles === 'function') {
      return this.ragKnowledgeManager.cleanupDeletedKnowledgeFiles();
    }
    throw new Error('cleanupDeletedKnowledgeFiles not implemented');
  }

  async getMemoryById(id: UUID) {
    if (typeof this.documentsManager.getMemoryById === 'function') {
      return this.documentsManager.getMemoryById(id);
    }
    throw new Error('getMemoryById not implemented');
  }

  generateScopedId(path: string, isShared: boolean) {
    if (typeof this.ragKnowledgeManager.generateScopedId === 'function') {
      return this.ragKnowledgeManager.generateScopedId(path, isShared);
    }
    throw new Error('generateScopedId not implemented');
  }

  async getKnowledge(params: any) {
    if (typeof this.ragKnowledgeManager.getKnowledge === 'function') {
      return this.ragKnowledgeManager.getKnowledge(params);
    }
    throw new Error('getKnowledge not implemented');
  }

  async removeKnowledge(id: UUID) {
    if (typeof this.ragKnowledgeManager.removeKnowledge === 'function') {
      return this.ragKnowledgeManager.removeKnowledge(id);
    }
    throw new Error('removeKnowledge not implemented');
  }

  async processFile(file: any) {
    if (typeof this.ragKnowledgeManager.processFile === 'function') {
      return this.ragKnowledgeManager.processFile(file);
    }
    throw new Error('processFile not implemented');
  }

  async createKnowledge(item: any) {
    if (typeof this.ragKnowledgeManager.createKnowledge === 'function') {
      return this.ragKnowledgeManager.createKnowledge(item);
    }
    throw new Error('createKnowledge not implemented');
  }

  async getMemories(params: Parameters<IMemoryManager["getMemories"]>[0]) {
    return this.messageManager.getMemories(params);
  }

  async getMemoriesByRoomIds(params: Parameters<IMemoryManager["getMemoriesByRoomIds"]>[0]) {
    return this.messageManager.getMemoriesByRoomIds(params);
  }

  async createMemory(memory: Parameters<IMemoryManager["createMemory"]>[0], unique?: boolean) {
    return this.messageManager.createMemory(memory, unique);
  }

  // Add any other passthroughs as needed
} 