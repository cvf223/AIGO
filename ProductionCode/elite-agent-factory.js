#!/usr/bin/env node

/**
 * 🏭 ELITE AGENT FACTORY
 * ======================
 * 
 * Creates multiple specialized agents from character files
 * 
 * ✅ Dynamic agent creation
 * ✅ Character file loading
 * ✅ Agent specialization
 * ✅ Capability injection
 * ✅ Performance optimization
 * ✅ Learning integration
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { RealTimeIntegrationBridge } = require('./real-time-integration-bridge');
const { AwarenessSystem } = require('./awareness-system');
const { LearningSystemCore } = require('./learning-system-core');
const { ReinforcementLearning } = require('./reinforcement-learning');

// Import background task system
const { backgroundTaskManager, taskEvents, PRIORITY } = require('./agent-background-tasks');

// Import atomic task switcher
const { AtomicTaskSwitcher } = require('./AtomicTaskSwitcher');

// Import Moralis webhook server
const { MoralisWebhookServer } = require('./MoralisWebhookServer');

// Import Redis state manager
const { RedisStateManager } = require('./RedisStateManager');

// 🚀 NEW: Import our revolutionary learning systems
const { MasterLearningOrchestrator, AGENT_LAUNCH_CONFIGS } = require('./master-learning-orchestrator');
const { BoundedA2CDDPSystem } = require('./learning/bounded-a2c-ddp-system');
const { PolicyDistillationEngine } = require('./learning/policy-distillation-engine');
const { A2CMemoryIntegration } = require('./learning/a2c-memory-integration');

// Try to import LegendaryArbitrumSpecialist
let LegendaryArbitrumSpecialist;
try {
  LegendaryArbitrumSpecialist = require('./src/agents/LegendaryArbitrumSpecialist').LegendaryArbitrumSpecialist;
} catch (error) {
  console.warn('⚠️ LegendaryArbitrumSpecialist not found, using base class');
  LegendaryArbitrumSpecialist = class LegendaryArbitrumSpecialist extends EventEmitter {
    constructor(config) {
      super();
      this.config = config;
      this.name = 'LegendaryArbitrumSpecialist';
    }
  };
}

// Try to import AwarenessEnhancedArbitrageAgent
let AwarenessEnhancedArbitrageAgent;
try {
  AwarenessEnhancedArbitrageAgent = require('./src/agents/AwarenessEnhancedArbitrageAgent').AwarenessEnhancedArbitrageAgent;
} catch (error) {
  console.warn('⚠️ AwarenessEnhancedArbitrageAgent not found, using base class');
  AwarenessEnhancedArbitrageAgent = class AwarenessEnhancedArbitrageAgent extends EventEmitter {
    constructor(config) {
      super();
      this.config = config;
      this.name = 'AwarenessEnhancedArbitrageAgent';
    }
  };
}

class EliteAgentFactory extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      charactersDir: './characters',
      teamLeadersDir: './characters/team-leaders',
      maxAgents: 10,
      defaultCapabilities: ['marketAwareness', 'opportunityDetection', 'riskAssessment'],
      enableLearning: true,
      enableAwareness: true,
      enableBackgroundTasks: true,
      backgroundTaskSavePath: './data/tasks',
      backgroundTaskSaveInterval: 60000, // 1 minute
      maxConcurrentTasks: 5,
      taskHistoryLength: 1000,
      atomicSwitchMaxTimeMs: 1.4,
      enableMoralisWebhook: true,
      moralisWebhookPort: process.env.MORALIS_WEBHOOK_PORT || 3333,
      moralisApiKey: process.env.MORALIS_API_KEY,
      moralisNetworks: ['arbitrum', 'base', 'polygon'],
      moralisWebhookEndpoints: [
        process.env.PRIMARY_WEBHOOK_URL,
        process.env.BACKUP_WEBHOOK_URL,
        process.env.FAILOVER_WEBHOOK_URL
      ].filter(Boolean),
      priceImpactThreshold: 0.005, // 0.5%,
      enableRedisStateManager: true,
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      redisStateTtl: parseInt(process.env.REDIS_TASK_STATE_TTL || 3600),
      redisStateCompression: process.env.STATE_COMPRESSION_ENABLED === 'true',
      redisMaxStateSizeMb: parseInt(process.env.MAX_STATE_SIZE_MB || 10),
      ...config
    };
    
    // Connect to integration bridge
    this.bridge = new RealTimeIntegrationBridge();
    
    // Created agents
    this.agents = new Map();
    
    // Character definitions
    this.characters = new Map();
    
    // Shared systems
    this.awarenessSystem = null;
    this.learningSystem = null;
    this.reinforcementLearning = null;
    this.backgroundTaskManager = null;
    this.moralisWebhookServer = null;
    this.redisStateManager = null;
    
    console.log('🏭 Elite Agent Factory initialized');
  }
  
  /**
   * Initialize the factory
   */
  async initialize() {
    try {
      console.log('🏭 Initializing Elite Agent Factory...');
      
      // Register with integration bridge
      this.bridge.registerComponent('agentFactory', this, [
        'agentCreated',
        'agentDestroyed',
        'error'
      ]);
      
      // Initialize shared systems
      await this._initializeSharedSystems();
      
      // Load character definitions
      await this._loadCharacterDefinitions();
      
      console.log('✅ Elite Agent Factory initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Elite Agent Factory:', error);
      return false;
    }
  }
  
  /**
   * Initialize shared systems
   */
  async _initializeSharedSystems() {
    // Initialize Redis state manager if enabled
    if (this.config.enableRedisStateManager) {
      try {
        this.redisStateManager = new RedisStateManager({
          url: this.config.redisUrl,
          ttl: this.config.redisStateTtl,
          compression: this.config.redisStateCompression,
          maxSizeInMb: this.config.redisMaxStateSizeMb
        });
        
        await this.redisStateManager.initialize();
        console.log('✅ Redis State Manager initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Redis State Manager:', error);
      }
    }
    
    // Initialize awareness system if enabled
    if (this.config.enableAwareness) {
      try {
        this.awarenessSystem = new AwarenessSystem();
        await this.awarenessSystem.initialize();
        console.log('✅ Awareness System initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Awareness System:', error);
      }
    }
    
    // Initialize learning system if enabled
    if (this.config.enableLearning) {
      try {
        this.learningSystem = new LearningSystemCore();
        await this.learningSystem.initialize();
        console.log('✅ Learning System initialized');
        
        this.reinforcementLearning = new ReinforcementLearning();
        await this.reinforcementLearning.initialize();
        console.log('✅ Reinforcement Learning initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Learning System:', error);
      }
    }
    
    // Initialize background task system if enabled
    if (this.config.enableBackgroundTasks) {
      try {
        // Configure the background task manager
        this.backgroundTaskManager = backgroundTaskManager;
        this.backgroundTaskManager.maxConcurrentTasks = this.config.maxConcurrentTasks;
        this.backgroundTaskManager.maxHistoryLength = this.config.taskHistoryLength;
        this.backgroundTaskManager.savePath = this.config.backgroundTaskSavePath;
        this.backgroundTaskManager.saveInterval = this.config.backgroundTaskSaveInterval;
        
        // Override task state methods to use Redis if available
        if (this.redisStateManager) {
          const originalSaveTaskState = this.backgroundTaskManager.saveTaskState;
          const originalLoadTaskState = this.backgroundTaskManager.loadTaskState;
          
          // Override save task state
          this.backgroundTaskManager.saveTaskState = async (taskId) => {
            try {
              // Get task from manager
              const task = this.backgroundTaskManager.getTask(taskId);
              if (!task) return null;
              
              // Save task state to Redis
              const success = await this.redisStateManager.saveTaskState(taskId, task.state);
              
              // Fall back to original method if Redis fails
              if (!success) {
                return originalSaveTaskState.call(this.backgroundTaskManager, taskId);
              }
              
              return task.state;
            } catch (error) {
              console.error(`❌ Failed to save task state to Redis for ${taskId}:`, error);
              // Fall back to original method
              return originalSaveTaskState.call(this.backgroundTaskManager, taskId);
            }
          };
          
          // Override load task state
          this.backgroundTaskManager.loadTaskState = async (taskId) => {
            try {
              // Try to load from Redis first
              const redisState = await this.redisStateManager.loadTaskState(taskId);
              
              // If found in Redis, return it
              if (redisState) {
                return redisState;
              }
              
              // Fall back to original method
              return originalLoadTaskState.call(this.backgroundTaskManager, taskId);
            } catch (error) {
              console.error(`❌ Failed to load task state from Redis for ${taskId}:`, error);
              // Fall back to original method
              return originalLoadTaskState.call(this.backgroundTaskManager, taskId);
            }
          };
          
          // Override save discoveries to use Redis
          const originalSaveDiscoveries = this.backgroundTaskManager._saveDiscoveries;
          this.backgroundTaskManager._saveDiscoveries = async () => {
            try {
              // Get discoveries from manager
              const discoveries = this.backgroundTaskManager.discoveries || [];
              
              // Save each discovery to Redis
              for (const discovery of discoveries) {
                await this.redisStateManager.storeDiscovery(
                  discovery.id || `discovery_${Date.now()}`,
                  discovery
                );
              }
              
              // Fall back to original method for file persistence
              return originalSaveDiscoveries.call(this.backgroundTaskManager);
            } catch (error) {
              console.error('❌ Failed to save discoveries to Redis:', error);
              // Fall back to original method
              return originalSaveDiscoveries.call(this.backgroundTaskManager);
            }
          };
          
          console.log('✅ Integrated Redis State Manager with Background Task Manager');
        }
        
        // Start the background task manager
        this.backgroundTaskManager.start();
        
        // Listen for task events
        taskEvents.on('taskCompleted', (data) => {
          this.bridge.emit('backgroundTaskCompleted', data);
        });
        
        taskEvents.on('taskFailed', (data) => {
          this.bridge.emit('backgroundTaskFailed', data);
        });
        
        taskEvents.on('discovery', (data) => {
          this.bridge.emit('agentDiscovery', data);
          
          // Store discovery in Redis if available
          if (this.redisStateManager) {
            this.redisStateManager.storeDiscovery(
              data.id || `discovery_${Date.now()}`,
              data
            );
          }
        });
        
        console.log('✅ Background Task System initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Background Task System:', error);
      }
    }
    
    // Initialize Moralis webhook server if enabled
    if (this.config.enableMoralisWebhook) {
      try {
        this.moralisWebhookServer = new MoralisWebhookServer({
          port: this.config.moralisWebhookPort,
          apiKey: this.config.moralisApiKey,
          networks: this.config.moralisNetworks,
          webhookEndpoints: this.config.moralisWebhookEndpoints,
          priceImpactThreshold: this.config.priceImpactThreshold
        });
        
        // Initialize webhook server
        await this.moralisWebhookServer.initialize();
        
        // Listen for significant swap events
        this.moralisWebhookServer.on('significantSwap', (swapData) => {
          console.log(`🔄 Significant swap detected: ${(swapData.priceImpact * 100).toFixed(2)}% price impact on ${swapData.chain}`);
          
          // Forward to bridge
          this.bridge.emit('priceImpactDetected', swapData);
        });
        
        console.log('✅ Moralis Webhook Server initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Moralis Webhook Server:', error);
      }
    }
  }
  
  /**
   * Load character definitions from files
   */
  async _loadCharacterDefinitions() {
    try {
      // Load regular characters
      const characterFiles = this._getCharacterFiles(this.config.charactersDir);
      
      for (const file of characterFiles) {
        try {
          const characterData = this._loadCharacterFile(file);
          this.characters.set(characterData.id, characterData);
        } catch (error) {
          console.error(`❌ Failed to load character file ${file}:`, error);
        }
      }
      
      // Load team leaders
      const teamLeaderFiles = this._getCharacterFiles(this.config.teamLeadersDir);
      
      for (const file of teamLeaderFiles) {
        try {
          const characterData = this._loadCharacterFile(file);
          characterData.isTeamLeader = true;
          this.characters.set(characterData.id, characterData);
        } catch (error) {
          console.error(`❌ Failed to load team leader file ${file}:`, error);
        }
      }
      
      console.log(`✅ Loaded ${this.characters.size} character definitions`);
    } catch (error) {
      console.error('❌ Failed to load character definitions:', error);
    }
  }
  
  /**
   * Get character files from directory
   * @param {string} directory - Directory path
   * @returns {string[]} Array of file paths
   */
  _getCharacterFiles(directory) {
    try {
      const files = fs.readdirSync(directory);
      return files
        .filter(file => file.endsWith('.json') || file.endsWith('.character.json'))
        .map(file => path.join(directory, file));
    } catch (error) {
      console.error(`❌ Failed to read directory ${directory}:`, error);
      return [];
    }
  }
  
  /**
   * Load character file
   * @param {string} filePath - File path
   * @returns {object} Character data
   */
  _loadCharacterFile(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const characterData = JSON.parse(fileContent);
      
      // Add file path to character data
      characterData.filePath = filePath;
      
      // Generate ID if not present
      if (!characterData.id) {
        characterData.id = path.basename(filePath, path.extname(filePath));
      }
      
      return characterData;
    } catch (error) {
      throw new Error(`Failed to load character file ${filePath}: ${error.message}`);
    }
  }
  
  /**
   * Create an agent from a character
   * @param {string} characterId - Character ID
   * @param {object} config - Agent configuration
   * @returns {object} Created agent
   */
  async createAgent(characterId, config = {}) {
    try {
      // Check if we've reached the maximum number of agents
      if (this.agents.size >= this.config.maxAgents) {
        throw new Error(`Maximum number of agents (${this.config.maxAgents}) reached`);
      }
      
      // Get character data
      const characterData = this.characters.get(characterId);
      
      if (!characterData) {
        throw new Error(`Character not found: ${characterId}`);
      }
      
      // Generate agent ID
      const agentId = `${characterId}-${Date.now()}`;
      
      // Determine agent class based on character type
      const AgentClass = this._getAgentClass(characterData);
      
      // Merge configuration
      const agentConfig = {
        id: agentId,
        character: characterData,
        capabilities: [...this.config.defaultCapabilities],
        ...config
      };
      
      // Add shared systems
      if (this.awarenessSystem) {
        agentConfig.awarenessSystem = this.awarenessSystem;
      }
      
      if (this.learningSystem) {
        agentConfig.learningSystem = this.learningSystem;
      }
      
      if (this.reinforcementLearning) {
        agentConfig.reinforcementLearning = this.reinforcementLearning;
      }
      
      // Add state manager if available
      if (this.redisStateManager) {
        agentConfig.stateManager = this.redisStateManager;
      }
      
      // Create agent
      const agent = new AgentClass(agentConfig);
      
      // Initialize agent
      if (agent.initialize && typeof agent.initialize === 'function') {
        await agent.initialize();
      }
      
      // Add capabilities
      if (characterData.capabilities && Array.isArray(characterData.capabilities)) {
        for (const capability of characterData.capabilities) {
          await this._injectCapability(agent, capability);
        }
      }
      
      // Inject background tasks if enabled
      if (this.config.enableBackgroundTasks && this.backgroundTaskManager) {
        await this._injectBackgroundTasks(agent);
      }
      
      // Store agent
      this.agents.set(agentId, agent);
      
      // Register agent with bridge
      this.bridge.registerComponent(`agent:${agentId}`, agent, [
        'opportunityDetected',
        'opportunityExecuted',
        'statusUpdate',
        'error'
      ]);
      
      // Emit event
      this.emit('agentCreated', {
        agentId,
        characterId,
        type: characterData.type || 'standard'
      });
      
      console.log(`✅ Created agent ${agentId} from character ${characterId}`);
      
      return agent;
    } catch (error) {
      console.error(`❌ Failed to create agent from character ${characterId}:`, error);
      
      // Emit error
      this.emit('error', {
        message: `Failed to create agent from character ${characterId}`,
        error: error.message,
        stack: error.stack
      });
      
      return null;
    }
  }
  
  /**
   * Create multiple agents from characters
   * @param {string[]} characterIds - Character IDs
   * @param {object} config - Agent configuration
   * @returns {object[]} Created agents
   */
  async createAgents(characterIds, config = {}) {
    const agents = [];
    
    for (const characterId of characterIds) {
      const agent = await this.createAgent(characterId, config);
      
      if (agent) {
        agents.push(agent);
      }
    }
    
    return agents;
  }
  
  /**
   * Create a team of agents with a leader
   * @param {string} leaderCharacterId - Leader character ID
   * @param {string[]} memberCharacterIds - Member character IDs
   * @param {object} config - Team configuration
   * @returns {object} Team object
   */
  async createTeam(leaderCharacterId, memberCharacterIds, config = {}) {
    try {
      // Create leader agent
      const leader = await this.createAgent(leaderCharacterId, {
        ...config,
        isTeamLeader: true
      });
      
      if (!leader) {
        throw new Error(`Failed to create team leader from character ${leaderCharacterId}`);
      }
      
      // Create member agents
      const members = [];
      
      for (const characterId of memberCharacterIds) {
        const member = await this.createAgent(characterId, {
          ...config,
          teamLeaderId: leader.id
        });
        
        if (member) {
          members.push(member);
        }
      }
      
      // Create team object
      const team = {
        id: `team-${Date.now()}`,
        leader,
        members,
        size: members.length + 1
      };
      
      // Connect team members
      if (leader.setTeamMembers && typeof leader.setTeamMembers === 'function') {
        leader.setTeamMembers(members);
      }
      
      console.log(`✅ Created team with leader ${leader.id} and ${members.length} members`);
      
      return team;
    } catch (error) {
      console.error(`❌ Failed to create team with leader ${leaderCharacterId}:`, error);
      
      // Emit error
      this.emit('error', {
        message: `Failed to create team with leader ${leaderCharacterId}`,
        error: error.message,
        stack: error.stack
      });
      
      return null;
    }
  }
  
  /**
   * Destroy an agent
   * @param {string} agentId - Agent ID
   * @returns {boolean} Success
   */
  async destroyAgent(agentId) {
    try {
      // Get agent
      const agent = this.agents.get(agentId);
      
      if (!agent) {
        throw new Error(`Agent not found: ${agentId}`);
      }
      
      // Shutdown agent
      if (agent.shutdown && typeof agent.shutdown === 'function') {
        await agent.shutdown();
      }
      
      // Remove from bridge
      this.bridge.unregisterComponent(`agent:${agentId}`);
      
      // Remove from agents map
      this.agents.delete(agentId);
      
      // Emit event
      this.emit('agentDestroyed', {
        agentId
      });
      
      console.log(`✅ Destroyed agent ${agentId}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to destroy agent ${agentId}:`, error);
      
      // Emit error
      this.emit('error', {
        message: `Failed to destroy agent ${agentId}`,
        error: error.message,
        stack: error.stack
      });
      
      return false;
    }
  }
  
  /**
   * Get agent class based on character type
   * @param {object} characterData - Character data
   * @returns {class} Agent class
   */
  _getAgentClass(characterData) {
    const type = characterData.type || 'standard';
    
    switch (type) {
      case 'arbitrum-specialist':
        return LegendaryArbitrumSpecialist;
      case 'awareness-enhanced':
        return AwarenessEnhancedArbitrageAgent;
      default:
        // Default to LegendaryArbitrumSpecialist
        return LegendaryArbitrumSpecialist;
    }
  }
  
  /**
   * Inject a capability into an agent
   * @param {object} agent - Agent instance
   * @param {string} capability - Capability name
   */
  async _injectCapability(agent, capability) {
    try {
      // Skip if agent already has this capability
      if (agent.capabilities && agent.capabilities.includes(capability)) {
        return;
      }
      
      // Add capability to agent
      if (!agent.capabilities) {
        agent.capabilities = [];
      }
      
      agent.capabilities.push(capability);
      
      // Load capability module
      let capabilityModule;
      
      try {
        capabilityModule = require(`./capabilities/${capability}`);
      } catch (error) {
        console.warn(`⚠️ Capability module not found: ${capability}`);
        return;
      }
      
      // Apply capability to agent
      if (capabilityModule.inject && typeof capabilityModule.inject === 'function') {
        await capabilityModule.inject(agent);
        console.log(`✅ Injected capability ${capability} into agent ${agent.id}`);
      }
    } catch (error) {
      console.error(`❌ Failed to inject capability ${capability}:`, error);
    }
  }
  
  /**
   * Inject background tasks into agent based on its character type
   * @param {object} agent - Agent instance
   */
  async _injectBackgroundTasks(agent) {
    try {
      const characterData = agent.character;
      const agentRole = characterData.role || characterData.type || 'standard';
      
      // Connect the agent to the background task manager
      agent.backgroundTaskManager = this.backgroundTaskManager;
      
      // Create atomic task switcher for this agent
      agent.taskSwitcher = new AtomicTaskSwitcher({
        agent: agent,
        backgroundTaskManager: this.backgroundTaskManager,
        stateManager: this.redisStateManager,
        maxSwitchTimeMs: this.config.atomicSwitchMaxTimeMs,
        saveStateBeforeSwitch: true,
        forceRestoreOnFailure: true
      });
      
      // Add atomic switch method as convenience function
      agent.atomicTaskSwitch = async (opportunityData) => {
        return agent.taskSwitcher.switchToOpportunityMode(opportunityData);
      };
      
      // Connect task switcher to bridge events
      this.bridge.on('priceImpactDetected', async (eventData) => {
        // Filter by chain if agent is chain-specific
        if (agent.config && agent.config.chain && 
            eventData.chain && agent.config.chain !== eventData.chain) {
          return;
        }
        
        // Check price impact threshold (0.5%)
        if (eventData.priceImpact && eventData.priceImpact >= 0.005) {
          console.log(`🔄 Significant price impact detected (${(eventData.priceImpact * 100).toFixed(2)}%), switching tasks for agent ${agent.id}`);
          await agent.taskSwitcher.switchToOpportunityMode(eventData);
        }
      });
      
      // Register role-specific background tasks
      switch (agentRole) {
        case 'arbitrum-specialist':
          await this._registerArbitrumSpecialistTasks(agent);
          break;
        case 'base-analyst':
          await this._registerBaseAnalystTasks(agent);
          break;
        case 'polygon-specialist':
          await this._registerPolygonSpecialistTasks(agent);
          break;
        case 'flash-loan-executor':
          await this._registerExecutorTasks(agent);
          break;
        case 'coordinator':
          await this._registerCoordinatorTasks(agent);
          break;
        default:
          await this._registerStandardTasks(agent);
      }
      
      // Register custom tasks if defined in character data
      if (characterData.backgroundTasks && Array.isArray(characterData.backgroundTasks)) {
        for (const taskData of characterData.backgroundTasks) {
          // Skip if task handler not found or no task name
          if (!taskData.name) continue;
          
          // Try to find the task handler
          const handlerName = `task_${taskData.name}`;
          if (agent[handlerName] && typeof agent[handlerName] === 'function') {
            this.backgroundTaskManager.registerTask({
              name: taskData.name,
              description: taskData.description || `${taskData.name} for ${agent.id}`,
              agentId: agent.id,
              priority: taskData.priority || PRIORITY.MEDIUM,
              interval: taskData.interval || 60000,
              handler: async (task) => agent[handlerName](task)
            });
          }
        }
      }
      
      console.log(`✅ Registered background tasks for agent ${agent.id}`);
    } catch (error) {
      console.error(`❌ Failed to inject background tasks for agent ${agent.id}:`, error);
    }
  }
  
  /**
   * Register background tasks for Arbitrum Specialist
   * @param {object} agent - Agent instance
   */
  async _registerArbitrumSpecialistTasks(agent) {
    // Register gas monitoring task
    this.backgroundTaskManager.registerTask({
      name: 'gas_monitoring',
      description: 'Monitor Arbitrum gas prices and trends',
      agentId: agent.id,
      priority: PRIORITY.HIGH,
      interval: 60000, // Every minute
      handler: async (task) => {
        if (agent.task_gas_monitoring && typeof agent.task_gas_monitoring === 'function') {
          return agent.task_gas_monitoring(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement gas_monitoring task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
    
    // Register sequencer analysis task
    this.backgroundTaskManager.registerTask({
      name: 'sequencer_analysis',
      description: 'Analyze Arbitrum sequencer patterns',
      agentId: agent.id,
      priority: PRIORITY.MEDIUM,
      interval: 300000, // Every 5 minutes
      handler: async (task) => {
        if (agent.task_sequencer_analysis && typeof agent.task_sequencer_analysis === 'function') {
          return agent.task_sequencer_analysis(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement sequencer_analysis task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
    
    // Register MEV detection task
    this.backgroundTaskManager.registerTask({
      name: 'mev_detection',
      description: 'Detect MEV patterns on Arbitrum',
      agentId: agent.id,
      priority: PRIORITY.MEDIUM,
      interval: 120000, // Every 2 minutes
      handler: async (task) => {
        if (agent.task_mev_detection && typeof agent.task_mev_detection === 'function') {
          return agent.task_mev_detection(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement mev_detection task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
    
    // Register liquidity mapping task
    this.backgroundTaskManager.registerTask({
      name: 'liquidity_mapping',
      description: 'Map token pair liquidity across Arbitrum DEXes',
      agentId: agent.id,
      priority: PRIORITY.LOW,
      interval: 900000, // Every 15 minutes
      handler: async (task) => {
        if (agent.task_liquidity_mapping && typeof agent.task_liquidity_mapping === 'function') {
          return agent.task_liquidity_mapping(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement liquidity_mapping task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
  }
  
  /**
   * Register background tasks for Base Chain Analyst
   * @param {object} agent - Agent instance
   */
  async _registerBaseAnalystTasks(agent) {
    // Register fee analysis task
    this.backgroundTaskManager.registerTask({
      name: 'fee_analysis',
      description: 'Analyze Base chain fee structures',
      agentId: agent.id,
      priority: PRIORITY.HIGH,
      interval: 60000, // Every minute
      handler: async (task) => {
        if (agent.task_fee_analysis && typeof agent.task_fee_analysis === 'function') {
          return agent.task_fee_analysis(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement fee_analysis task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
    
    // Register OP Stack performance task
    this.backgroundTaskManager.registerTask({
      name: 'op_stack_performance',
      description: 'Monitor OP Stack performance metrics',
      agentId: agent.id,
      priority: PRIORITY.MEDIUM,
      interval: 300000, // Every 5 minutes
      handler: async (task) => {
        if (agent.task_op_stack_performance && typeof agent.task_op_stack_performance === 'function') {
          return agent.task_op_stack_performance(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement op_stack_performance task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
    
    // Register cross-DEX liquidity mapping task
    this.backgroundTaskManager.registerTask({
      name: 'cross_dex_liquidity',
      description: 'Map cross-DEX liquidity on Base chain',
      agentId: agent.id,
      priority: PRIORITY.LOW,
      interval: 600000, // Every 10 minutes
      handler: async (task) => {
        if (agent.task_cross_dex_liquidity && typeof agent.task_cross_dex_liquidity === 'function') {
          return agent.task_cross_dex_liquidity(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement cross_dex_liquidity task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
    
    // Register historical arbitrage analysis task
    this.backgroundTaskManager.registerTask({
      name: 'historical_arbitrage_analysis',
      description: 'Analyze historical arbitrage success patterns',
      agentId: agent.id,
      priority: PRIORITY.LOW,
      interval: 3600000, // Every hour
      handler: async (task) => {
        if (agent.task_historical_arbitrage_analysis && typeof agent.task_historical_arbitrage_analysis === 'function') {
          return agent.task_historical_arbitrage_analysis(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement historical_arbitrage_analysis task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
  }
  
  /**
   * Register background tasks for Polygon Specialist
   * @param {object} agent - Agent instance
   */
  async _registerPolygonSpecialistTasks(agent) {
    // Register MATIC gas volatility task
    this.backgroundTaskManager.registerTask({
      name: 'matic_volatility',
      description: 'Monitor MATIC gas price volatility',
      agentId: agent.id,
      priority: PRIORITY.HIGH,
      interval: 60000, // Every minute
      handler: async (task) => {
        if (agent.task_matic_volatility && typeof agent.task_matic_volatility === 'function') {
          return agent.task_matic_volatility(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement matic_volatility task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
    
    // Register block time consistency task
    this.backgroundTaskManager.registerTask({
      name: 'block_time_consistency',
      description: 'Check Polygon block time consistency',
      agentId: agent.id,
      priority: PRIORITY.MEDIUM,
      interval: 300000, // Every 5 minutes
      handler: async (task) => {
        if (agent.task_block_time_consistency && typeof agent.task_block_time_consistency === 'function') {
          return agent.task_block_time_consistency(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement block_time_consistency task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
    
    // Register bridge monitoring task
    this.backgroundTaskManager.registerTask({
      name: 'bridge_monitoring',
      description: 'Monitor Polygon bridge opportunities',
      agentId: agent.id,
      priority: PRIORITY.MEDIUM,
      interval: 600000, // Every 10 minutes
      handler: async (task) => {
        if (agent.task_bridge_monitoring && typeof agent.task_bridge_monitoring === 'function') {
          return agent.task_bridge_monitoring(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement bridge_monitoring task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
    
    // Register validator response time task
    this.backgroundTaskManager.registerTask({
      name: 'validator_response_time',
      description: 'Analyze Polygon validator response times',
      agentId: agent.id,
      priority: PRIORITY.LOW,
      interval: 1800000, // Every 30 minutes
      handler: async (task) => {
        if (agent.task_validator_response_time && typeof agent.task_validator_response_time === 'function') {
          return agent.task_validator_response_time(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement validator_response_time task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
  }
  
  /**
   * Register standard background tasks for any agent
   * @param {object} agent - Agent instance
   */
  async _registerStandardTasks(agent) {
    // Register performance analysis task
    this.backgroundTaskManager.registerTask({
      name: 'performance_analysis',
      description: 'Analyze agent performance metrics',
      agentId: agent.id,
      priority: PRIORITY.LOW,
      interval: 900000, // Every 15 minutes
      handler: async (task) => {
        if (agent.task_performance_analysis && typeof agent.task_performance_analysis === 'function') {
          return agent.task_performance_analysis(task);
        }
        
        console.log(`⚠️ Agent ${agent.id} does not implement performance_analysis task handler`);
        return { status: 'skipped', reason: 'handler_not_implemented' };
      }
    });
  }
  
  /**
   * Register background tasks for Flash Loan Executor
   * @param {object} agent - Agent instance
   */
  async _registerExecutorTasks(agent) {
    // Implementation for executor tasks
    // Similar structure to other specialist task registration methods
  }
  
  /**
   * Register background tasks for Coordinator
   * @param {object} agent - Agent instance
   */
  async _registerCoordinatorTasks(agent) {
    // Implementation for coordinator tasks
    // Similar structure to other specialist task registration methods
  }
  
  /**
   * Get all agents
   * @returns {object[]} Array of agents
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }
  
  /**
   * Get agent by ID
   * @param {string} agentId - Agent ID
   * @returns {object|null} Agent or null if not found
   */
  getAgent(agentId) {
    return this.agents.get(agentId) || null;
  }
  
  /**
   * Get all characters
   * @returns {object[]} Array of characters
   */
  getAllCharacters() {
    return Array.from(this.characters.values());
  }
  
  /**
   * Get character by ID
   * @param {string} characterId - Character ID
   * @returns {object|null} Character or null if not found
   */
  getCharacter(characterId) {
    return this.characters.get(characterId) || null;
  }
  
  /**
   * Get factory status
   * @returns {object} Factory status
   */
  getStatus() {
    return {
      agentCount: this.agents.size,
      characterCount: this.characters.size,
      awarenessSystemActive: this.awarenessSystem !== null,
      learningSystemActive: this.learningSystem !== null,
      reinforcementLearningActive: this.reinforcementLearning !== null
    };
  }
  
  /**
   * Shutdown the factory
   */
  async shutdown() {
    console.log('🛑 Shutting down Elite Agent Factory...');
    
    // Destroy all agents
    const agentIds = Array.from(this.agents.keys());
    
    for (const agentId of agentIds) {
      await this.destroyAgent(agentId);
    }
    
    // Shutdown shared systems
    if (this.awarenessSystem && this.awarenessSystem.shutdown) {
      await this.awarenessSystem.shutdown();
    }
    
    if (this.learningSystem && this.learningSystem.shutdown) {
      await this.learningSystem.shutdown();
    }
    
    if (this.reinforcementLearning && this.reinforcementLearning.shutdown) {
      await this.reinforcementLearning.shutdown();
    }
    
    // Stop background task manager
    if (this.backgroundTaskManager) {
      this.backgroundTaskManager.stop();
    }
    
    // Shutdown Moralis webhook server
    if (this.moralisWebhookServer) {
      await this.moralisWebhookServer.shutdown();
    }
    
    // Shutdown Redis state manager
    if (this.redisStateManager) {
      await this.redisStateManager.shutdown();
    }
    
    console.log('✅ Elite Agent Factory shut down successfully');
    return true;
  }
}

// 🎮 ELITE AGENT COORDINATOR
class EliteAgentCoordinator {
    constructor(agentFactory) {
        this.agentFactory = agentFactory;
        this.agents = new Map();
        this.coordinationStrategy = 'collaborative';
        this.performanceMetrics = new Map();
        
        console.log('🎮 Elite Agent Coordinator initialized');
    }
    
    async startCollective() {
        console.log('🚀 Starting Elite Agent Collective...');
        
        // Create all agents
        const agents = await this.agentFactory.createAllAgents();
        
        // Store agents for coordination
        for (const agent of agents) {
            this.agents.set(agent.agentId, agent);
        }
        
        // Start coordination cycles
        this.startCoordinationCycles();
        
        console.log(`🎯 Elite Agent Collective started with ${agents.length} agents`);
        return agents;
    }
    
    startCoordinationCycles() {
        // Performance monitoring
        setInterval(async () => {
            await this.monitorAgentPerformance();
        }, 30000); // Every 30 seconds
        
        // Strategy sharing
        setInterval(async () => {
            await this.facilitateStrategySharing();
        }, 60000); // Every minute
        
        // Collective learning
        setInterval(async () => {
            await this.updateCollectiveLearning();
        }, 120000); // Every 2 minutes
    }
    
    async monitorAgentPerformance() {
        for (const [agentId, agent] of this.agents) {
            const status = agent.getStatus();
            this.performanceMetrics.set(agentId, {
                ...status,
                timestamp: Date.now()
            });
        }
    }
    
    async facilitateStrategySharing() {
        console.log('🔄 Facilitating strategy sharing among agents...');
        
        // Find agents with successful strategies
        const successfulAgents = Array.from(this.agents.values())
            .filter(agent => agent.performance.successfulExecutions > 0)
            .sort((a, b) => b.performance.totalProfits - a.performance.totalProfits);
        
        // Share top strategies
        for (const agent of successfulAgents.slice(0, 3)) {
            await this.shareAgentStrategies(agent);
        }
    }
    
    async shareAgentStrategies(agent) {
        const strategies = agent.getTopStrategies(3);
        
        for (const strategy of strategies) {
            await this.agentFactory.sharedKnowledge.storeStrategy(
                agent.agentId,
                strategy.name,
                strategy,
                strategy.blockchainProof
            );
        }
    }
    
    async updateCollectiveLearning() {
        console.log('🧠 Updating collective learning from agent experiences...');
        
        // Aggregate learning from all agents
        const collectiveLearnings = new Map();
        
        for (const [agentId, agent] of this.agents) {
            const learnings = agent.getRecentLearnings();
            
            for (const learning of learnings) {
                const key = learning.type;
                if (!collectiveLearnings.has(key)) {
                    collectiveLearnings.set(key, []);
                }
                collectiveLearnings.get(key).push({
                    agentId,
                    learning
                });
            }
        }
        
        // Process and store collective insights
        for (const [type, learnings] of collectiveLearnings) {
            if (learnings.length >= 2) { // Need confirmation from multiple agents
                await this.processCollectiveLearning(type, learnings);
            }
        }
    }
    
    async processCollectiveLearning(type, learnings) {
        const insight = this.synthesizeInsight(learnings);
        
        await this.agentFactory.sharedKnowledge.storeLearning(
            type,
            insight,
            'collective_intelligence',
            learnings.map(l => l.learning.blockchainProof).filter(Boolean)
        );
    }
    
    synthesizeInsight(learnings) {
        // Synthesize collective insight from multiple agent learnings
        return {
            type: 'collective_insight',
            contributingAgents: learnings.map(l => l.agentId),
            commonPatterns: this.findCommonPatterns(learnings),
            confidence: learnings.length / this.agents.size,
            timestamp: Date.now()
        };
    }
    
    findCommonPatterns(learnings) {
        // Find patterns that appear across multiple agents
        const patterns = new Map();
        
        for (const {learning} of learnings) {
            if (learning.patterns) {
                for (const pattern of learning.patterns) {
                    patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
                }
            }
        }
        
        // Return patterns seen by multiple agents
        return Array.from(patterns.entries())
            .filter(([pattern, count]) => count >= 2)
            .map(([pattern, count]) => ({ pattern, frequency: count }));
    }
    
    // 📊 Get collective status
    getCollectiveStatus() {
        const agentStatuses = {};
        for (const [agentId, agent] of this.agents) {
            agentStatuses[agentId] = agent.getStatus();
        }
        
        return {
            totalAgents: this.agents.size,
            coordinationStrategy: this.coordinationStrategy,
            agentStatuses,
            collectivePerformance: this.calculateCollectivePerformance(),
            timestamp: Date.now()
        };
    }
    
    calculateCollectivePerformance() {
        let totalProfits = 0;
        let totalExecutions = 0;
        let totalSuccesses = 0;
        
        for (const [agentId, agent] of this.agents) {
            totalProfits += agent.performance.totalProfits;
            totalExecutions += agent.performance.successfulExecutions + agent.performance.failedExecutions;
            totalSuccesses += agent.performance.successfulExecutions;
        }
        
        return {
            totalProfits,
            totalExecutions,
            successRate: totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0,
            averageProfitPerAgent: this.agents.size > 0 ? totalProfits / this.agents.size : 0
        };
    }
}

export { EliteAgentFactory, EliteAgentCoordinator }; 