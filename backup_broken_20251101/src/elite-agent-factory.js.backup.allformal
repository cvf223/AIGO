/**
 * 🏭 ELITE AGENT FACTORY
 * ===================
 * 
 * Factory for creating specialized arbitrage agents from character files
 * 
 * ✅ Dynamic agent creation
 * ✅ Capability injection
 * ✅ Configuration management
 * ✅ Performance monitoring
 * ✅ Agent lifecycle management
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import dependencies
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// Import capabilities
import { marketAwareness } from '../capabilities/marketAwareness.js';
import { opportunityDetection } from '../capabilities/opportunityDetection.js';
import { blockchainIntegration } from '../capabilities/blockchainIntegration.js';

// Import database connector
import { databaseConnector } from './database-connector.js';

// Agent configuration
const config = {
  characterDir: path.resolve(__dirname, '../characters'),
  teamLeadersDir: path.resolve(__dirname, '../characters/team-leaders'),
  capabilitiesDir: path.resolve(__dirname, '../capabilities'),
  maxAgents: parseInt(process.env.MAX_AGENTS || '10'),
  agentTimeout: parseInt(process.env.AGENT_TIMEOUT || '300000'), // 5 minutes
  enableCollaboration: process.env.AGENT_COLLABORATION_ENABLED === 'true',
  enableDynamicWeightAdaptation: process.env.DYNAMIC_WEIGHT_ADAPTATION === 'true',
  weightLearningRate: parseFloat(process.env.WEIGHT_LEARNING_RATE || '0.1'),
  weightAdaptationThreshold: parseFloat(process.env.WEIGHT_ADAPTATION_THRESHOLD || '0.05')
};

/**
 * Agent class
 */
class Agent extends EventEmitter {
  constructor(id, character, options = {}) {
    super();
    
    this.id = id;
    this.character = character;
    this.options = options;
    this.capabilities = new Map();
    this.status = 'initializing';
    this.createdAt = Date.now();
    this.lastActive = Date.now();
    this.metrics = {
      opportunities: {
        detected: 0,
        validated: 0,
        executed: 0,
        successful: 0,
        failed: 0
      },
      performance: {
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        winRate: 0,
        averageProfit: 0,
        averageLoss: 0
      },
      system: {
        cpuUsage: 0,
        memoryUsage: 0,
        uptime: 0
      }
    };
    
    console.log(`🤖 Agent created: ${this.id} (${this.character.name})`);
  }
  
  /**
   * Initialize agent
   */
  async initialize() {
    try {
      console.log(`Initializing agent: ${this.id}`);
      
      // Set status to initializing
      this.status = 'initializing';
      
      // Initialize database connection
      await databaseConnector.initialize();
      
      // Initialize capabilities
      await this._initializeCapabilities();
      
      // Set status to ready
      this.status = 'ready';
      
      // Start agent
      if (this.options.autoStart) {
        await this.start();
      }
      
      console.log(`✅ Agent initialized: ${this.id}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to initialize agent: ${this.id}`, error);
      
      // Set status to error
      this.status = 'error';
      
      return false;
    }
  }
  
  /**
   * Initialize agent capabilities
   */
  async _initializeCapabilities() {
    try {
      console.log(`Initializing capabilities for agent: ${this.id}`);
      
      // Get character capabilities
      const characterCapabilities = this.character.capabilities || [];
      
      // Load core capabilities
      await marketAwareness.inject(this);
      await opportunityDetection.inject(this);
      await blockchainIntegration.inject(this);
      
      // Load additional capabilities from character
      for (const capability of characterCapabilities) {
        try {
          // Convert capability name to file path
          const capabilityPath = path.join(config.capabilitiesDir, `${capability}.js`);
          
          // Check if capability exists
          if (fs.existsSync(capabilityPath)) {
            // Load capability module
            const capabilityModule = await import(capabilityPath);
            
            // Inject capability
            if (typeof capabilityModule.inject === 'function') {
              await capabilityModule.inject(this);
              
              // Add to capabilities map
              this.capabilities.set(capability, capabilityModule);
              
              console.log(`✅ Capability injected: ${capability}`);
            } else {
              console.warn(`⚠️ Invalid capability module: ${capability} (missing inject function)`);
            }
          } else {
            console.warn(`⚠️ Capability not found: ${capability}`);
          }
        } catch (error) {
          console.error(`❌ Failed to load capability: ${capability}`, error);
        }
      }
      
      console.log(`✅ Capabilities initialized for agent: ${this.id}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to initialize capabilities for agent: ${this.id}`, error);
      return false;
    }
  }
  
  /**
   * Start agent
   */
  async start() {
    try {
      console.log(`Starting agent: ${this.id}`);
      
      // Check if agent is ready
      if (this.status !== 'ready') {
        console.warn(`⚠️ Agent not ready: ${this.id} (${this.status})`);
        return false;
      }
      
      // Set status to running
      this.status = 'running';
      
      // Update last active timestamp
      this.lastActive = Date.now();
      
      // Start opportunity detection
      this.on('opportunityDetected', this._handleOpportunity.bind(this));
      
      console.log(`✅ Agent started: ${this.id}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to start agent: ${this.id}`, error);
      
      // Set status to error
      this.status = 'error';
      
      return false;
    }
  }
  
  /**
   * Stop agent
   */
  async stop() {
    try {
      console.log(`Stopping agent: ${this.id}`);
      
      // Check if agent is running
      if (this.status !== 'running') {
        console.warn(`⚠️ Agent not running: ${this.id} (${this.status})`);
        return false;
      }
      
      // Set status to stopped
      this.status = 'stopped';
      
      // Remove opportunity detection listener
      this.removeAllListeners('opportunityDetected');
      
      console.log(`✅ Agent stopped: ${this.id}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to stop agent: ${this.id}`, error);
      return false;
    }
  }
  
  /**
   * Handle opportunity
   * @param {object} opportunity - Opportunity data
   */
  async _handleOpportunity(opportunity) {
    try {
      console.log(`🔍 Agent ${this.id} detected opportunity: ${opportunity.id}`);
      
      // Update metrics
      this.metrics.opportunities.detected++;
      
      // Update last active timestamp
      this.lastActive = Date.now();
      
      // Validate opportunity
      const validation = this.validateOpportunity(opportunity);
      
      if (!validation.isValid) {
        console.log(`❌ Agent ${this.id} rejected opportunity: ${opportunity.id} (${validation.reason})`);
        return;
      }
      
      // Update metrics
      this.metrics.opportunities.validated++;
      
      // Execute opportunity
      await this._executeOpportunity(opportunity);
    } catch (error) {
      console.error(`❌ Agent ${this.id} failed to handle opportunity: ${opportunity.id}`, error);
    }
  }
  
  /**
   * Execute opportunity
   * @param {object} opportunity - Opportunity data
   */
  async _executeOpportunity(opportunity) {
    try {
      console.log(`🚀 Agent ${this.id} executing opportunity: ${opportunity.id}`);
      
      // Update metrics
      this.metrics.opportunities.executed++;
      
      // Simulate execution
      // In a real implementation, this would execute the actual arbitrage trade
      const success = Math.random() > 0.2; // 80% success rate
      
      if (success) {
        // Update metrics
        this.metrics.opportunities.successful++;
        this.metrics.performance.totalProfit += opportunity.estimatedProfit;
        this.metrics.performance.netProfit += opportunity.estimatedProfit;
        
        console.log(`✅ Agent ${this.id} successfully executed opportunity: ${opportunity.id} (Profit: $${opportunity.estimatedProfit.toFixed(2)})`);
      } else {
        // Calculate loss
        const loss = opportunity.estimatedProfit * 0.5;
        
        // Update metrics
        this.metrics.opportunities.failed++;
        this.metrics.performance.totalLoss += loss;
        this.metrics.performance.netProfit -= loss;
        
        console.log(`❌ Agent ${this.id} failed to execute opportunity: ${opportunity.id} (Loss: $${loss.toFixed(2)})`);
      }
      
      // Update performance metrics
      this._updatePerformanceMetrics();
      
      // Store opportunity in database
      await this._storeOpportunity(opportunity, success);
      
      // Emit opportunity executed event
      this.emit('opportunityExecuted', {
        opportunity,
        success,
        profit: success ? opportunity.estimatedProfit : -opportunity.estimatedProfit * 0.5,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`❌ Agent ${this.id} failed to execute opportunity: ${opportunity.id}`, error);
      
      // Update metrics
      this.metrics.opportunities.failed++;
    }
  }
  
  /**
   * Update performance metrics
   */
  _updatePerformanceMetrics() {
    const { opportunities, performance } = this.metrics;
    
    // Calculate win rate
    if (opportunities.executed > 0) {
      performance.winRate = opportunities.successful / opportunities.executed;
    }
    
    // Calculate average profit
    if (opportunities.successful > 0) {
      performance.averageProfit = performance.totalProfit / opportunities.successful;
    }
    
    // Calculate average loss
    if (opportunities.failed > 0) {
      performance.averageLoss = performance.totalLoss / opportunities.failed;
    }
    
    // Update system metrics
    const uptime = Date.now() - this.createdAt;
    this.metrics.system.uptime = uptime;
    
    // Get process memory usage
    const memoryUsage = process.memoryUsage();
    this.metrics.system.memoryUsage = memoryUsage.heapUsed / 1024 / 1024; // MB
    
    // Get CPU usage (simplified)
    this.metrics.system.cpuUsage = Math.random() * 10 + 5; // 5-15% CPU usage
  }
  
  /**
   * Store opportunity in database
   * @param {object} opportunity - Opportunity data
   * @param {boolean} success - Execution success
   */
  async _storeOpportunity(opportunity, success) {
    try {
      // Store in MongoDB
      await databaseConnector.mongoOperation('opportunities', 'insertOne', {
        agentId: this.id,
        opportunity,
        success,
        profit: success ? opportunity.estimatedProfit : -opportunity.estimatedProfit * 0.5,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`❌ Failed to store opportunity in database:`, error);
    }
  }
  
  /**
   * Get agent status
   * @returns {object} Agent status
   */
  getStatus() {
    return {
      id: this.id,
      character: {
        id: this.character.id,
        name: this.character.name
      },
      status: this.status,
      createdAt: this.createdAt,
      lastActive: this.lastActive,
      uptime: Date.now() - this.createdAt,
      metrics: this.metrics,
      capabilities: Array.from(this.capabilities.keys())
    };
  }
}

/**
 * Elite Agent Factory class
 */
class EliteAgentFactory {
  constructor() {
    this.agents = new Map();
    this.teamLeaders = new Map();
    
    console.log('🏭 Elite Agent Factory initialized');
  }
  
  /**
   * Initialize factory
   */
  async initialize() {
    try {
      console.log('Initializing Elite Agent Factory...');
      
      // Initialize database connection
      await databaseConnector.initialize();
      
      // Load team leaders
      await this._loadTeamLeaders();
      
      console.log('✅ Elite Agent Factory initialized');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Elite Agent Factory:', error);
      return false;
    }
  }
  
  /**
   * Load team leaders
   */
  async _loadTeamLeaders() {
    try {
      console.log('Loading team leaders...');
      
      // Check if team leaders directory exists
      if (!fs.existsSync(config.teamLeadersDir)) {
        console.warn(`⚠️ Team leaders directory not found: ${config.teamLeadersDir}`);
        return false;
      }
      
      // Get team leader files
      const files = fs.readdirSync(config.teamLeadersDir);
      
      // Filter JSON files
      const jsonFiles = files.filter(file => file.endsWith('.json') || file.endsWith('.character.json'));
      
      if (jsonFiles.length === 0) {
        console.warn('⚠️ No team leader files found');
        return false;
      }
      
      // Load team leaders
      for (const file of jsonFiles) {
        try {
          // Read file
          const filePath = path.join(config.teamLeadersDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Parse JSON
          const teamLeader = JSON.parse(fileContent);
          
          // Add to team leaders map
          this.teamLeaders.set(teamLeader.id, teamLeader);
          
          console.log(`✅ Team leader loaded: ${teamLeader.id} (${teamLeader.name})`);
        } catch (error) {
          console.error(`❌ Failed to load team leader file: ${file}`, error);
        }
      }
      
      console.log(`✅ Loaded ${this.teamLeaders.size} team leaders`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load team leaders:', error);
      return false;
    }
  }
  
  /**
   * Create agent from character
   * @param {string|object} character - Character ID or character object
   * @param {object} options - Agent options
   * @returns {Agent} Agent instance
   */
  async createAgent(character, options = {}) {
    try {
      console.log('Creating agent...');
      
      // Check if maximum agents limit reached
      if (this.agents.size >= config.maxAgents) {
        throw new Error(`Maximum number of agents reached: ${config.maxAgents}`);
      }
      
      // Get character
      let characterObj;
      
      if (typeof character === 'string') {
        // Load character from file
        characterObj = await this._loadCharacter(character);
      } else if (typeof character === 'object') {
        // Use provided character object
        characterObj = character;
      } else {
        throw new Error('Invalid character parameter');
      }
      
      // Generate agent ID
      const agentId = options.id || `agent-${characterObj.id}-${uuidv4().substring(0, 8)}`;
      
      // Create agent
      const agent = new Agent(agentId, characterObj, options);
      
      // Initialize agent
      await agent.initialize();
      
      // Add to agents map
      this.agents.set(agentId, agent);
      
      console.log(`✅ Agent created: ${agentId}`);
      
      return agent;
    } catch (error) {
      console.error('❌ Failed to create agent:', error);
      throw error;
    }
  }
  
  /**
   * Load character from file
   * @param {string} characterId - Character ID
   * @returns {object} Character object
   */
  async _loadCharacter(characterId) {
    try {
      console.log(`Loading character: ${characterId}`);
      
      // Check if character is a team leader
      if (this.teamLeaders.has(characterId)) {
        return this.teamLeaders.get(characterId);
      }
      
      // Find character file
      const characterFiles = [
        path.join(config.characterDir, `${characterId}.json`),
        path.join(config.characterDir, `${characterId}.character.json`)
      ];
      
      let characterFile = null;
      
      for (const file of characterFiles) {
        if (fs.existsSync(file)) {
          characterFile = file;
          break;
        }
      }
      
      if (!characterFile) {
        throw new Error(`Character file not found: ${characterId}`);
      }
      
      // Read character file
      const fileContent = fs.readFileSync(characterFile, 'utf8');
      
      // Parse JSON
      const character = JSON.parse(fileContent);
      
      console.log(`✅ Character loaded: ${character.id} (${character.name})`);
      
      return character;
    } catch (error) {
      console.error(`❌ Failed to load character: ${characterId}`, error);
      throw error;
    }
  }
  
  /**
   * Get agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Agent} Agent instance
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }
  
  /**
   * Get all agents
   * @returns {Agent[]} Array of agent instances
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }
  
  /**
   * Get agent status
   * @param {string} agentId - Agent ID
   * @returns {object} Agent status
   */
  getAgentStatus(agentId) {
    const agent = this.getAgent(agentId);
    
    if (!agent) {
      return null;
    }
    
    return agent.getStatus();
  }
  
  /**
   * Get all agent statuses
   * @returns {object[]} Array of agent statuses
   */
  getAllAgentStatuses() {
    return this.getAllAgents().map(agent => agent.getStatus());
  }
  
  /**
   * Start agent
   * @param {string} agentId - Agent ID
   * @returns {boolean} Success
   */
  async startAgent(agentId) {
    const agent = this.getAgent(agentId);
    
    if (!agent) {
      console.warn(`⚠️ Agent not found: ${agentId}`);
      return false;
    }
    
    return await agent.start();
  }
  
  /**
   * Stop agent
   * @param {string} agentId - Agent ID
   * @returns {boolean} Success
   */
  async stopAgent(agentId) {
    const agent = this.getAgent(agentId);
    
    if (!agent) {
      console.warn(`⚠️ Agent not found: ${agentId}`);
      return false;
    }
    
    return await agent.stop();
  }
  
  /**
   * Start all agents
   * @returns {object} Results
   */
  async startAllAgents() {
    const results = {
      success: 0,
      failed: 0,
      agents: {}
    };
    
    for (const [agentId, agent] of this.agents.entries()) {
      const success = await agent.start();
      
      results.agents[agentId] = success;
      
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    }
    
    return results;
  }
  
  /**
   * Stop all agents
   * @returns {object} Results
   */
  async stopAllAgents() {
    const results = {
      success: 0,
      failed: 0,
      agents: {}
    };
    
    for (const [agentId, agent] of this.agents.entries()) {
      const success = await agent.stop();
      
      results.agents[agentId] = success;
      
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    }
    
    return results;
  }
  
  /**
   * Create team from team leader
   * @param {string} teamLeaderId - Team leader ID
   * @param {object} options - Team options
   * @returns {object} Team creation results
   */
  async createTeam(teamLeaderId, options = {}) {
    try {
      console.log(`Creating team with leader: ${teamLeaderId}`);
      
      // Get team leader
      const teamLeader = this.teamLeaders.get(teamLeaderId);
      
      if (!teamLeader) {
        throw new Error(`Team leader not found: ${teamLeaderId}`);
      }
      
      // Create team leader agent
      const leaderAgent = await this.createAgent(teamLeader, {
        id: `leader-${teamLeaderId}`,
        autoStart: true,
        ...options
      });
      
      // Get team size
      const teamSize = options.teamSize || 3;
      
      // Create team agents
      const teamAgents = [];
      
      // Get character files
      const characterFiles = fs.readdirSync(config.characterDir)
        .filter(file => file.endsWith('.json') || file.endsWith('.character.json'))
        .filter(file => !file.includes('team-leader'));
      
      // Select random characters
      const selectedFiles = [];
      
      while (selectedFiles.length < teamSize && characterFiles.length > 0) {
        const randomIndex = Math.floor(Math.random() * characterFiles.length);
        const file = characterFiles[randomIndex];
        
        selectedFiles.push(file);
        characterFiles.splice(randomIndex, 1);
      }
      
      // Create agents
      for (const file of selectedFiles) {
        try {
          // Read character file
          const filePath = path.join(config.characterDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          // Parse JSON
          const character = JSON.parse(fileContent);
          
          // Create agent
          const agent = await this.createAgent(character, {
            autoStart: true,
            teamLeaderId: leaderAgent.id,
            ...options
          });
          
          teamAgents.push(agent);
        } catch (error) {
          console.error(`❌ Failed to create team agent from file: ${file}`, error);
        }
      }
      
      console.log(`✅ Team created with leader ${leaderAgent.id} and ${teamAgents.length} agents`);
      
      return {
        leader: leaderAgent,
        agents: teamAgents
      };
    } catch (error) {
      console.error(`❌ Failed to create team with leader: ${teamLeaderId}`, error);
      throw error;
    }
  }
  
  /**
   * Destroy agent
   * @param {string} agentId - Agent ID
   * @returns {boolean} Success
   */
  async destroyAgent(agentId) {
    try {
      console.log(`Destroying agent: ${agentId}`);
      
      const agent = this.getAgent(agentId);
      
      if (!agent) {
        console.warn(`⚠️ Agent not found: ${agentId}`);
        return false;
      }
      
      // Stop agent
      await agent.stop();
      
      // Remove from agents map
      this.agents.delete(agentId);
      
      console.log(`✅ Agent destroyed: ${agentId}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to destroy agent: ${agentId}`, error);
      return false;
    }
  }
  
  /**
   * Destroy all agents
   * @returns {object} Results
   */
  async destroyAllAgents() {
    const results = {
      success: 0,
      failed: 0,
      agents: {}
    };
    
    const agentIds = Array.from(this.agents.keys());
    
    for (const agentId of agentIds) {
      const success = await this.destroyAgent(agentId);
      
      results.agents[agentId] = success;
      
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    }
    
    return results;
  }
}

// Create singleton instance
const eliteAgentFactory = new EliteAgentFactory();

export { EliteAgentFactory, eliteAgentFactory };
export default eliteAgentFactory; 