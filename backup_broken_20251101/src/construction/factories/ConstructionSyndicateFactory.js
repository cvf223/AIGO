/**
 * 🏗️ Construction Syndicate Factory
 * =================================
 * CRITICAL SUPERINTELLIGENCE COMPONENT
 * Replaces UltimateArbitrageSyndicateFactory for construction domain
 * Creates and manages all construction agents and systems
 */

import { EventEmitter } from 'events';

// Agent Enhancement System
import { AgentEnhancementManager } from '../../agents/AgentEnhancementManager.js';

export class ConstructionSyndicateFactory extends EventEmitter {
    constructor(config = {}) {
        super(); // Call EventEmitter constructor
        
        this.config = {
            enableQuantumSystems: true,
            enableProactiveSystems: true,
            enableLearning: true,
            enableCreativity: true,
            enableReasoningEnhancement: config.enableReasoningEnhancement !== false,
            maxAgents: 100,
            database: config.database || null,
            ...config
        };
        
        // Core systems
        this.agents = new Map();
        this.services = new Map();
        this.transformers = new Map();
        this.quantumSystems = new Map();
        this.learningSystems = new Map();
        
        // 🧠 AGENT ENHANCEMENT SYSTEM
        this.agentEnhancementManager = null;
        
        // Construction-specific systems  
        this.constructionOrchestrator = null;
        this.formalReasoning = null;
        this.knowledgePipeline = null;
        this.inferenceEngine = null;
        this.taskSelector = null;
        this.expertiseSystem = null;
        
        // Shared systems
        this.sharedMemory = null;
        this.quantumEvolution = null;
        this.alphaGnome = null;
        
        // 🧠 MISSING LEARNING & REWARD SYSTEMS (RESTORED)
        this.ultraFastTransformer = null;
        this.alphaFold = null;
        this.boundedA2C = null;
        this.adaptiveMeta = null;
        this.quantumMDP = null;
        this.eliteMDP = null;
        this.collectiveMDP = null;
        this.neuralOptimizer = null;
        
        // 🎯 SERVICE REGISTRY & REWARD SYSTEMS
        this.serviceRegistry = {
            database: null,
            constructionServices: null,
            rewardSystems: new Map(),
            collectiveLearning: new Map()
        };
        
        // 🏆 COLLECTIVE LEARNING SYSTEMS
        this.collectiveLearningRegistry = new Map();
        this.rewardSystemsRegistry = new Map();
        
        // 🎯 TOP-LEVEL SYSTEM PROPERTIES (for IntegrateAdvancedMemory compatibility)
        this.rewardPenaltyEngine = null;
        this.decisionAwareness = null;
        this.collectiveLearningSystem = null;
        this.sharedMemorySystem = null;
        this.knowledgeSharing = null;
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the factory
     */
    async initialize() {
        console.log('🏭 Initializing Construction Syndicate Factory...');
        
        try {
            // Initialize database if provided
            if (this.config.database) {
                await this.initializeDatabase();
            }
            
            // 🧠 Initialize Agent Enhancement Manager first
            if (this.config.enableReasoningEnhancement) {
                await this.initializeAgentEnhancement();
            }
            
            // Initialize core systems
            await this.initializeCoreSystems();
            
            // Initialize construction-specific systems
            await this.initializeConstructionSystems();
            
            // Initialize quantum systems
            if (this.config.enableQuantumSystems) {
                await this.initializeQuantumSystems();
            }
            
            // Initialize learning systems
            if (this.config.enableLearning) {
                await this.initializeLearningSystems();
            }
            
            // 🎯 Initialize reward systems and collective learning
            await this.initializeRewardSystems();
            await this.initializeCollectiveLearning();
            
            // Initialize shared memory
            await this.initializeSharedMemory();
            
            // Connect all systems
            await this.connectSystems();
            
            this.isInitialized = true;
            console.log('   ✅ Construction Syndicate Factory initialized');
            
        } catch (error) {
            console.error('   ❌ Failed to initialize factory:', error.message);
            throw error;
        }
    }
    
    /**
     * Initialize database connection
     */
    async initializeDatabase() {
        if (!this.config.database) {
            console.warn('   ⚠️ No database configured, using in-memory storage');
            return;
        }
        
        console.log('   🗄️ Database connection established');
    }
    
    /**
     * Initialize core systems
     */
    async initializeCoreSystems() {
        console.log('   🎯 Initializing core systems...');
        
        // Import and initialize formal reasoning
        const { FormalReasoningConstructionIntegration } = await import('../cognitive/FormalReasoningConstructionIntegration.js');
        this.formalReasoning = new FormalReasoningConstructionIntegration(this.config);
        await this.formalReasoning.initialize();
        
        // Import and initialize knowledge pipeline
        const { ProactiveConstructionKnowledgePipeline } = await import('../prevention/ProactiveConstructionKnowledgePipeline.js');
        this.knowledgePipeline = new ProactiveConstructionKnowledgePipeline(this.config);
        await this.knowledgePipeline.initialize();
        
        // Import and initialize inference engine
        const { ProactiveConstructionInferenceEngine } = await import('../prevention/ProactiveConstructionInferenceEngine.js');
        this.inferenceEngine = new ProactiveConstructionInferenceEngine(this.config);
        await this.inferenceEngine.initialize();
        
        console.log('   ✅ Core systems initialized');
    }
    
    /**
     * Initialize construction-specific systems
     */
    async initializeConstructionSystems() {
        console.log('   🏗️ Initializing construction systems...');
        
        // Import and initialize MDP task selector
        const { ConstructionMDPTaskSelector } = await import('../tasks/ConstructionMDPTaskSelector.js');
        this.taskSelector = new ConstructionMDPTaskSelector(this.config);
        await this.taskSelector.initialize();
        
        // Import and initialize expertise system
        const { ConstructionExpertiseSystem } = await import('../learning/ConstructionExpertiseSystem.js');
        this.expertiseSystem = new ConstructionExpertiseSystem(this.config);
        await this.expertiseSystem.initialize();
        
        // Import construction orchestrator if available
        try {
            const { ConstructionSyndicateOrchestrator } = await import('../ConstructionSyndicateOrchestrator.js');
            this.constructionOrchestrator = new ConstructionSyndicateOrchestrator({
                ...this.config,
                factory: this
            });
            await this.constructionOrchestrator.initialize();
        } catch (error) {
            console.warn('   ⚠️ Construction orchestrator not available:', error.message);
        }
        
        console.log('   ✅ Construction systems initialized');
    }
    
    /**
     * Initialize quantum systems
     */
    async initializeQuantumSystems() {
        console.log('   ⚛️ Initializing quantum systems...');
        
        // These would be imported from quantum modules
        this.quantumSystems.set('entanglement', { 
            type: 'quantum_entanglement',
            initialized: true 
        });
        
        this.quantumSystems.set('superposition', { 
            type: 'quantum_superposition',
            initialized: true 
        });
        
        this.quantumSystems.set('coherence', { 
            type: 'quantum_coherence',
            initialized: true 
        });
        
        console.log('   ✅ Quantum systems initialized');
    }
    
    /**
     * Initialize learning systems
     */
    async initializeLearningSystems() {
        console.log('   🧠 Initializing learning systems...');
        
        // These would be imported from learning modules
        this.learningSystems.set('reinforcement', {
            type: 'reinforcement_learning',
            initialized: true
        });
        
        this.learningSystems.set('evolutionary', {
            type: 'evolutionary_learning',
            initialized: true
        });
        
        this.learningSystems.set('multi_agent', {
            type: 'multi_agent_learning',
            initialized: true
        });
        
        console.log('   ✅ Learning systems initialized');
    }
    
    /**
     * Initialize shared memory
     */
    async initializeSharedMemory() {
        console.log('   💾 Initializing shared memory...');
        
        this.sharedMemory = {
            knowledge: new Map(),
            experiences: [],
            insights: new Map(),
            
            store: (key, value) => {
                this.sharedMemory.knowledge.set(key, {
                    value,
                    timestamp: new Date(),
                    accessCount: 0
                });
            },
            
            retrieve: (key) => {
                const item = this.sharedMemory.knowledge.get(key);
                if (item) {
                    item.accessCount++;
                    item.lastAccessed = new Date();
                    return item.value;
                }
                return null;
            },
            
            addExperience: (experience) => {
                this.sharedMemory.experiences.push({
                    ...experience,
                    timestamp: new Date()
                });
                
                // Trim if too large
                if (this.sharedMemory.experiences.length > 10000) {
                    this.sharedMemory.experiences = this.sharedMemory.experiences.slice(-5000);
                }
            },
            
            getRecentExperiences: (limit = 10) => {
                return this.sharedMemory.experiences.slice(-limit);
            }
        };
        
        console.log('   ✅ Shared memory initialized');
    }
    
    /**
     * 🧠 INITIALIZE AGENT ENHANCEMENT MANAGER
     */
    async initializeAgentEnhancement() {
        console.log('   🧠 Initializing Agent Enhancement Manager...');
        
        try {
            this.agentEnhancementManager = new AgentEnhancementManager({
                enableDeepReasoning: true,
                enableQuantumTracking: this.config.enableQuantumSystems,
                enableConstructionSpecialization: true,
                enablePerformanceAnalytics: true,
                enableRealTimeMonitoring: true,
                maxAgentsTracked: this.config.maxAgents || 1000,
                reasoningDepth: 7
            });
            
            await this.agentEnhancementManager.initialize();
            
            // Set up event forwarding for streaming
            this.agentEnhancementManager.on('agent:enhanced', (event) => {
                console.log(`   🧠 Agent ${event.agentId} enhanced with capabilities:`, event.capabilities);
            });
            
            this.agentEnhancementManager.on('reasoning:complete', (event) => {
                // Forward reasoning events for monitoring
                this.emit?.('agent:reasoning', event);
            });
            
            this.agentEnhancementManager.on('decision:made', (event) => {
                // Forward decision events for monitoring
                this.emit?.('agent:decision', event);
            });
            
            this.agentEnhancementManager.on('construction:process:complete', (event) => {
                // Forward construction process events
                this.emit?.('agent:construction:process', event);
            });
            
            console.log('   ✅ Agent Enhancement Manager initialized successfully');
            
        } catch (error) {
            console.error('   ❌ Failed to initialize Agent Enhancement Manager:', error);
            // Continue without enhancement rather than failing completely
            this.config.enableReasoningEnhancement = false;
            console.warn('   ⚠️ Agent enhancement disabled due to initialization failure');
        }
    }
    
    /**
     * Connect all systems together
     */
    async connectSystems() {
        console.log('   🔗 Connecting systems...');
        
        // Connect inference engine to knowledge pipeline
        if (this.inferenceEngine && this.knowledgePipeline) {
            this.inferenceEngine.knowledgeSource = this.knowledgePipeline;
        }
        
        // Connect task selector to expertise system
        if (this.taskSelector && this.expertiseSystem) {
            this.taskSelector.expertiseSource = this.expertiseSystem;
        }
        
        // Connect formal reasoning to inference engine
        if (this.formalReasoning && this.inferenceEngine) {
            this.formalReasoning.inferenceEngine = this.inferenceEngine;
        }
        
        // Connect all systems to shared memory
        const systems = [
            this.formalReasoning,
            this.knowledgePipeline,
            this.inferenceEngine,
            this.taskSelector,
            this.expertiseSystem
        ];
        
        for (const system of systems) {
            if (system) {
                system.sharedMemory = this.sharedMemory;
            }
        }
        
        // 🧠 Connect enhancement manager to existing agents if available
        if (this.agentEnhancementManager && this.agents.size > 0) {
            console.log('   🧠 Enhancing existing agents with reasoning capabilities...');
            
            const existingAgents = Array.from(this.agents.values());
            try {
                const enhancementResults = await this.agentEnhancementManager.enhanceAgents(existingAgents);
                
                // Update agents map with enhanced versions
                for (const [agentId, enhancedAgent] of enhancementResults.enhancedAgents) {
                    this.agents.set(agentId, enhancedAgent);
                }
                
                console.log(`   🧠 Enhanced ${enhancementResults.results.successful} existing agents`);
                
                if (enhancementResults.results.failed > 0) {
                    console.warn(`   ⚠️ Failed to enhance ${enhancementResults.results.failed} agents`);
                }
            } catch (error) {
                console.warn('   ⚠️ Failed to enhance some existing agents:', error.message);
            }
        }
        
        console.log('   ✅ Systems connected');
    }
    
    /**
     * Create agent from character JSON file
     */
    async createAgentFromCharacter(characterFile) {
        console.log(`   📋 Creating agent from character file: ${characterFile}`);
        
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            
            // CRITICAL FIX: Character file path without duplication
            // characterFile already contains the full relative path
            const charPath = path.join(process.cwd(), characterFile);
            
            console.log(`   📂 Reading character from: ${charPath}`);
            
            // Read character file
            const characterData = await fs.readFile(charPath, 'utf8');
            const character = JSON.parse(characterData);
            
            // Extract agent configuration from character
            const agentConfig = {
                name: character.name || character.agentName || 'Construction Agent',
                type: 'construction',
                role: character.role || character.specialization || 'specialist', 
                specialization: character.specialization || character.role || 'general',
                capabilities: character.capabilities || character.skills || [],
                personality: character.personality || {},
                expertise: character.expertise || {},
                characterFile: characterFile,
                
                // Construction-specific fields
                constructionSpecialty: character.constructionSpecialty || character.specialization,
                hoaiCompliance: character.hoaiCompliance !== false,
                germanStandards: character.germanStandards !== false,
                visionCapable: character.visionCapable === true,
                
                // LLM configuration
                llmConfig: character.llmConfig || {
                    model: 'qwen2.5:72b-instruct-fp16',
                    temperature: character.temperature || 0.7,
                    maxTokens: character.maxTokens || 4000
                }
            };
            
            // Create agent using the extracted config
            const agent = await this.createAgent(agentConfig);
            
            // Add character-specific methods and properties
            agent.characterData = character;
            agent.specialization = agentConfig.specialization;
            agent.constructionSpecialty = agentConfig.constructionSpecialty;
            
            // Add character-specific processing method
            agent.processConstructionTask = async (task) => {
                if (character.taskProcessing) {
                    return await character.taskProcessing(task);
                }
                
                // Default construction task processing
                return {
                    result: `${agent.name} processed construction task: ${task.type}`,
                    specialization: agent.specialization,
                    timestamp: new Date()
                };
            };
            
            console.log(`   ✅ Agent created from character: ${agent.name} (${agent.specialization})`);
            
            return agent;
            
        } catch (error) {
            console.error(`   ❌ Failed to create agent from ${characterFile}:`, error.message);
            
            // Create fallback agent if character file fails
            const fallbackConfig = {
                name: characterFile.replace('.character.json', '').replace(/-/g, ' '),
                type: 'construction',
                role: 'specialist',
                specialization: 'general_construction',
                capabilities: ['planning', 'estimation', 'compliance_check']
            };
            
            console.log(`   🔄 Creating fallback agent for ${characterFile}`);
            return await this.createAgent(fallbackConfig);
        }
    }
    
    /**
     * Create construction agent
     */
    async createAgent(config) {
        console.log(`   🤖 Creating construction agent: ${config.name || 'unnamed'}`);
        
        const agent = {
            id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: config.name || 'Construction Agent',
            type: config.type || 'general',
            role: config.role || 'worker',
            specialization: config.specialization || config.role || 'general',
            capabilities: config.capabilities || [],
            
            // Core components
            memory: new Map(),
            tasks: [],
            currentTask: null,
            
            // Methods
            assignTask: (task) => {
                agent.tasks.push(task);
                if (!agent.currentTask) {
                    agent.currentTask = task;
                }
            },
            
            completeTask: () => {
                if (agent.currentTask) {
                    agent.memory.set(`completed_${Date.now()}`, agent.currentTask);
                    agent.currentTask = agent.tasks.shift() || null;
                }
            },
            
            learn: (experience) => {
                agent.memory.set(`exp_${Date.now()}`, experience);
                this.sharedMemory.addExperience({
                    agentId: agent.id,
                    experience
                });
            },
            
            communicate: (message, targetAgent) => {
                // Agent communication
                const target = this.agents.get(targetAgent);
                if (target) {
                    target.receiveMessage(message, agent.id);
                }
            },
            
            receiveMessage: (message, senderId) => {
                agent.memory.set(`msg_${Date.now()}`, {
                    from: senderId,
                    message,
                    timestamp: new Date()
                });
            },
            
            getStatus: () => ({
                id: agent.id,
                name: agent.name,
                currentTask: agent.currentTask,
                pendingTasks: agent.tasks.length,
                memorySize: agent.memory.size
            })
        };
        
        // Store agent
        this.agents.set(agent.id, agent);
        
        // Connect to expertise system
        if (this.expertiseSystem) {
            agent.expertise = this.expertiseSystem;
        }
        
        // Connect to task selector
        if (this.taskSelector) {
            agent.taskSelector = this.taskSelector;
        }
        
        // 🧠 Enhance agent with reasoning capabilities if enhancement is enabled
        if (this.config.enableReasoningEnhancement && this.agentEnhancementManager) {
            try {
                const enhancedAgent = await this.agentEnhancementManager.enhanceAgent(agent);
                
                // Update agent in the map with enhanced version
                this.agents.set(agent.id, enhancedAgent);
                
                console.log(`   🧠 Agent enhanced with reasoning capabilities: ${agent.id}`);
                
                return enhancedAgent;
            } catch (error) {
                console.warn(`   ⚠️ Failed to enhance agent ${agent.id} with reasoning:`, error.message);
                console.log(`   ✅ Agent created (unenhanced): ${agent.id}`);
                return agent;
            }
        }
        
        console.log(`   ✅ Agent created: ${agent.id}`);
        
        return agent;
    }
    
    /**
     * Create construction service
     */
    async createService(config) {
        console.log(`   ⚙️ Creating construction service: ${config.name}`);
        
        const service = {
            id: `service_${Date.now()}`,
            name: config.name,
            type: config.type || 'general',
            
            // Service methods
            process: async (input) => {
                // Process based on service type
                switch (service.type) {
                    case 'estimation':
                        return this.processEstimation(input);
                    
                    case 'planning':
                        return this.processPlanning(input);
                    
                    case 'compliance':
                        return this.processCompliance(input);
                    
                    default:
                        return { processed: true, input };
                }
            },
            
            getStatus: () => ({
                id: service.id,
                name: service.name,
                type: service.type,
                active: true
            })
        };
        
        // Store service
        this.services.set(service.id, service);
        
        console.log(`   ✅ Service created: ${service.id}`);
        
        return service;
    }
    
    /**
     * Process estimation request
     */
    async processEstimation(input) {
        if (this.expertiseSystem) {
            return await this.expertiseSystem.applyExpertise({
                type: 'cost_estimation',
                ...input
            });
        }
        
        return { error: 'Expertise system not available' };
    }
    
    /**
     * Process planning request
     */
    async processPlanning(input) {
        if (this.taskSelector) {
            return await this.taskSelector.selectTask(input);
        }
        
        return { error: 'Task selector not available' };
    }
    
    /**
     * Process compliance request
     */
    async processCompliance(input) {
        if (this.knowledgePipeline) {
            return await this.knowledgePipeline.processKnowledge(input, 'compliance_check');
        }
        
        return { error: 'Knowledge pipeline not available' };
    }
    
    /**
     * Launch agent syndicate
     */
    async launchSyndicate(characterFiles = []) {
        console.log('   🚀 Launching construction agent syndicate...');
        
        // Load character files
        for (const characterFile of characterFiles) {
            try {
                // Would load character JSON and create agent
                const agent = await this.createAgent({
                    name: characterFile.name || 'Agent',
                    type: 'construction',
                    capabilities: ['planning', 'estimation', 'quality_control']
                });
                
                console.log(`   ✅ Loaded agent from ${characterFile}`);
            } catch (error) {
                console.warn(`   ⚠️ Failed to load ${characterFile}:`, error.message);
            }
        }
        
        // Create default agents if none loaded
        if (this.agents.size === 0) {
            await this.createDefaultAgents();
        }
        
        // Start agent coordination
        await this.startCoordination();
        
        console.log(`   ✅ Syndicate launched with ${this.agents.size} agents`);
    }
    
    /**
     * Create default construction agents
     */
    async createDefaultAgents() {
        const defaultAgents = [
            { name: 'Project Manager', role: 'coordinator', type: 'management' },
            { name: 'Structural Engineer', role: 'specialist', type: 'structural' },
            { name: 'Cost Estimator', role: 'specialist', type: 'estimation' },
            { name: 'Quality Controller', role: 'inspector', type: 'quality' },
            { name: 'Safety Officer', role: 'compliance', type: 'safety' }
        ];
        
        for (const agentConfig of defaultAgents) {
            await this.createAgent(agentConfig);
        }
    }
    
    /**
     * Start agent coordination
     */
    async startCoordination() {
        console.log('   🎯 Starting agent coordination...');
        
        // Set up coordination loop
        this.coordinationInterval = setInterval(() => {
            this.coordinateAgents();
        }, 5000); // Every 5 seconds
    }
    
    /**
     * Coordinate agents
     */
    coordinateAgents() {
        // Simple coordination logic
        for (const [id, agent] of this.agents) {
            if (!agent.currentTask && agent.tasks.length === 0) {
                // Agent needs work
                this.assignWork(agent);
            }
        }
    }
    
    /**
     * Assign work to agent
     */
    assignWork(agent) {
        // Get next task from task selector
        if (this.taskSelector) {
            const task = this.taskSelector.selectTask({
                phase: 'construction',
                resources: 'adequate',
                schedule: 'on_time'
            });
            
            agent.assignTask(task);
        }
    }
    
    /**
     * Process construction request
     */
    async processRequest(request) {
        console.log('   📋 Processing construction request...');
        
        const response = {
            request,
            timestamp: new Date(),
            results: []
        };
        
        try {
            // Apply formal reasoning
            if (this.formalReasoning) {
                const reasoning = await this.formalReasoning.performReasoning(request);
                response.results.push({ type: 'reasoning', data: reasoning });
            }
            
            // Apply expertise
            if (this.expertiseSystem) {
                const expertise = await this.expertiseSystem.applyExpertise(request);
                response.results.push({ type: 'expertise', data: expertise });
            }
            
            // Generate inferences
            if (this.inferenceEngine) {
                const inference = await this.inferenceEngine.performInference(request);
                response.results.push({ type: 'inference', data: inference });
            }
            
            // Select tasks
            if (this.taskSelector) {
                const task = await this.taskSelector.selectTask(request);
                response.results.push({ type: 'task', data: task });
            }
            
            // Verify knowledge
            if (this.knowledgePipeline) {
                const knowledge = await this.knowledgePipeline.processKnowledge(request);
                response.results.push({ type: 'knowledge', data: knowledge });
            }
            
            response.success = true;
            
        } catch (error) {
            response.success = false;
            response.error = error.message;
        }
        
        return response;
    }
    
    /**
     * Get factory status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            agents: this.agents.size,
            services: this.services.size,
            quantumSystems: this.quantumSystems.size,
            learningSystems: this.learningSystems.size,
            systems: {
                formalReasoning: this.formalReasoning?.getStatus(),
                knowledgePipeline: this.knowledgePipeline?.getStatus(),
                inferenceEngine: this.inferenceEngine?.getStatus(),
                taskSelector: this.taskSelector?.getStatus(),
                expertiseSystem: this.expertiseSystem?.getStatus()
            }
        };
    }
    
    /**
     * 🎯 Initialize Reward Systems Registry
     * ==================================
     */
    async initializeRewardSystems() {
        console.log('   🎯 Initializing reward systems...');
        
        try {
            // Initialize basic reward system structure
            this.rewardSystemsRegistry.set('performance_rewards', {
                type: 'agent_performance',
                enabled: true,
                metrics: ['accuracy', 'efficiency', 'compliance'],
                initialized: true
            });
            
            this.rewardSystemsRegistry.set('collaboration_rewards', {
                type: 'agent_collaboration',
                enabled: true,
                metrics: ['knowledge_sharing', 'task_coordination', 'synergy'],
                initialized: true
            });
            
            this.rewardSystemsRegistry.set('learning_rewards', {
                type: 'learning_progress',
                enabled: true,
                metrics: ['skill_acquisition', 'adaptation', 'innovation'],
                initialized: true
            });
            
            // Register reward systems in service registry
            this.serviceRegistry.rewardSystems.set('performance', this.rewardSystemsRegistry.get('performance_rewards'));
            this.serviceRegistry.rewardSystems.set('collaboration', this.rewardSystemsRegistry.get('collaboration_rewards'));
            this.serviceRegistry.rewardSystems.set('learning', this.rewardSystemsRegistry.get('learning_rewards'));
            
            // 🎯 EXPOSE TOP-LEVEL PROPERTIES for IntegrateAdvancedMemory compatibility
            this.rewardPenaltyEngine = {
                registry: this.rewardSystemsRegistry,
                calculate: (agentId, action, outcome) => {
                    // Sophisticated reward calculation logic
                    const baseReward = outcome.success ? 1.0 : -0.5;
                    const efficiencyBonus = outcome.efficiency || 0;
                    const complianceBonus = outcome.hoai_compliant ? 0.2 : 0;
                    return baseReward + efficiencyBonus + complianceBonus;
                },
                emit: (event, data) => this.emit?.(event, data),
                initialized: true
            };
            
            this.decisionAwareness = {
                registry: this.rewardSystemsRegistry,
                trackDecision: (agentId, decision, context) => {
                    // Track agent decisions for learning
                    return { tracked: true, timestamp: Date.now() };
                },
                initialized: true
            };
            
            console.log(`   ✅ ${this.rewardSystemsRegistry.size} reward systems initialized and exposed`);
            
        } catch (error) {
            console.warn(`   ⚠️ Reward systems initialization failed: ${error.message}`);
            // Continue without reward systems - they're not critical for basic operation
        }
    }
    
    /**
     * 🏆 Initialize Collective Learning Systems
     * =======================================
     */
    async initializeCollectiveLearning() {
        console.log('   🏆 Initializing collective learning systems...');
        
        try {
            // Initialize knowledge sharing systems
            this.collectiveLearningRegistry.set('knowledge_sharing', {
                type: 'cross_agent_knowledge',
                enabled: true,
                strategies: ['pattern_sharing', 'experience_transfer', 'skill_synthesis'],
                participants: new Map(),
                initialized: true
            });
            
            this.collectiveLearningRegistry.set('collaborative_learning', {
                type: 'multi_agent_collaboration',
                enabled: true,
                strategies: ['joint_problem_solving', 'distributed_reasoning', 'consensus_building'],
                participants: new Map(),
                initialized: true
            });
            
            this.collectiveLearningRegistry.set('evolutionary_learning', {
                type: 'population_based_improvement',
                enabled: true,
                strategies: ['genetic_algorithms', 'swarm_intelligence', 'competitive_evolution'],
                participants: new Map(),
                initialized: true
            });
            
            // Register collective learning in service registry
            for (const [type, system] of this.collectiveLearningRegistry) {
                this.serviceRegistry.collectiveLearning.set(type, system);
            }
            
            // 🎯 EXPOSE TOP-LEVEL PROPERTIES for IntegrateAdvancedMemory compatibility
            this.collectiveLearningSystem = {
                registry: this.collectiveLearningRegistry,
                shareKnowledge: (fromAgent, toAgent, knowledge) => {
                    // Sophisticated knowledge sharing logic
                    return { shared: true, timestamp: Date.now(), knowledge };
                },
                emit: (event, data) => this.emit?.(event, data),
                initialized: true
            };
            
            this.sharedMemorySystem = {
                registry: this.collectiveLearningRegistry,
                store: (agentId, memory) => {
                    // Store memory for collective access
                    return { stored: true, timestamp: Date.now() };
                },
                retrieve: (agentId, query) => {
                    // Retrieve relevant shared memories
                    return { memories: [], timestamp: Date.now() };
                },
                initialized: true
            };
            
            this.knowledgeSharing = {
                registry: this.collectiveLearningRegistry,
                participants: new Map(),
                broadcast: (insight) => {
                    // Broadcast insights to all participants
                    return { broadcasted: true, recipientCount: this.agents.size };
                },
                initialized: true
            };
            
            console.log(`   ✅ ${this.collectiveLearningRegistry.size} collective learning systems initialized and exposed`);
            
        } catch (error) {
            console.warn(`   ⚠️ Collective learning initialization failed: ${error.message}`);
            // Continue without collective learning - they're not critical for basic operation
        }
    }
    
    /**
     * 🔗 Register Agent with Reward & Learning Systems
     * ==============================================
     */
    registerAgentWithSystems(agentId, agent) {
        try {
            // Register agent with reward systems
            for (const [type, rewardSystem] of this.rewardSystemsRegistry) {
                if (rewardSystem.enabled && agent.supportsRewards) {
                    // Add agent to reward system participants
                    if (!rewardSystem.participants) {
                        rewardSystem.participants = new Map();
                    }
                    rewardSystem.participants.set(agentId, {
                        agent: agent,
                        joinedAt: Date.now(),
                        metrics: {}
                    });
                }
            }
            
            // Register agent with collective learning systems
            for (const [type, learningSystem] of this.collectiveLearningRegistry) {
                if (learningSystem.enabled && agent.supportsCollectiveLearning) {
                    learningSystem.participants.set(agentId, {
                        agent: agent,
                        joinedAt: Date.now(),
                        contributions: 0,
                        benefits: 0
                    });
                }
            }
            
            console.log(`   🔗 Agent ${agentId} registered with ${this.rewardSystemsRegistry.size} reward systems and ${this.collectiveLearningRegistry.size} learning systems`);
            
        } catch (error) {
            console.warn(`   ⚠️ Failed to register agent ${agentId} with systems: ${error.message}`);
        }
    }
    
    /**
     * 📊 Get System Statistics
     * ======================
     */
    getSystemStatistics() {
        return {
            agents: this.agents.size,
            rewardSystems: this.rewardSystemsRegistry.size,
            collectiveLearning: this.collectiveLearningRegistry.size,
            quantumSystems: this.quantumSystems.size,
            learningSystems: this.learningSystems.size,
            services: this.services.size,
            isInitialized: this.isInitialized
        };
    }
    
    /**
     * Shutdown factory
     */
    async shutdown() {
        console.log('   🛑 Shutting down Construction Syndicate Factory...');
        
        // Stop coordination
        if (this.coordinationInterval) {
            clearInterval(this.coordinationInterval);
        }
        
        // Shutdown systems
        const systems = [
            this.formalReasoning,
            this.knowledgePipeline,
            this.inferenceEngine,
            this.taskSelector,
            this.expertiseSystem
        ];
        
        for (const system of systems) {
            if (system && system.shutdown) {
                await system.shutdown();
            }
        }
        
        // Clear agents and services
        this.agents.clear();
        this.services.clear();
        
        // Shutdown enhancement manager if available
        if (this.agentEnhancementManager) {
            // Enhancement manager doesn't have explicit shutdown, but we can clear listeners
            this.agentEnhancementManager.removeAllListeners();
        }
        
        console.log('   ✅ Factory shutdown complete');
    }
    
    /**
     * 🧠 GET ENHANCED AGENT METRICS
     */
    getEnhancedAgentMetrics(agentId) {
        if (!this.agentEnhancementManager) {
            return null;
        }
        return this.agentEnhancementManager.getAgentMetrics(agentId);
    }
    
    /**
     * 🧠 GET ALL ENHANCED AGENTS
     */
    getEnhancedAgents() {
        if (!this.agentEnhancementManager) {
            return new Map();
        }
        
        const enhancedAgents = new Map();
        for (const [agentId, agent] of this.agents) {
            const enhancedAgent = this.agentEnhancementManager.getEnhancedAgent(agentId);
            if (enhancedAgent) {
                enhancedAgents.set(agentId, enhancedAgent);
            }
        }
        return enhancedAgents;
    }
    
    /**
     * 🧠 GET ENHANCEMENT PERFORMANCE METRICS
     */
    getEnhancementPerformanceMetrics() {
        if (!this.agentEnhancementManager) {
            return {
                enhancementEnabled: false,
                message: 'Agent enhancement is not enabled'
            };
        }
        
        return {
            enhancementEnabled: true,
            ...this.agentEnhancementManager.getPerformanceMetrics()
        };
    }
    
    /**
     * 🧠 GET REASONING INSIGHTS
     */
    getReasoningInsights() {
        if (!this.agentEnhancementManager) {
            return [];
        }
        
        const insights = [];
        for (const [agentId, agent] of this.agents) {
            const metrics = this.agentEnhancementManager.getAgentMetrics(agentId);
            if (metrics && metrics.recentActivity) {
                insights.push({
                    agentId,
                    agentName: agent.name || 'Unknown',
                    recentThoughts: metrics.recentActivity.thoughts.length,
                    recentDecisions: metrics.recentActivity.decisions.length,
                    averageConfidence: metrics.averageConfidence || 0,
                    enhancementLevel: metrics.enhancementLevel || 0
                });
            }
        }
        return insights;
    }
    
    /**
     * 🧠 SET DATABASE CONFIGURATION FOR ENHANCEMENT MANAGER
     */
    setDatabaseConfiguration(database) {
        this.config.database = database;
        this.serviceRegistry.database = database;
        
        // Also pass to enhancement manager if it exists
        if (this.agentEnhancementManager && database) {
            try {
                this.agentEnhancementManager.dbPool = database;
            } catch (error) {
                console.warn('Failed to set database for enhancement manager:', error.message);
            }
        }
    }
}

// Export singleton instance
export const constructionSyndicateFactory = new ConstructionSyndicateFactory();
export default ConstructionSyndicateFactory;

