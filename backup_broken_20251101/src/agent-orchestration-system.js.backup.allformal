/**
 * 🎭 AGENT ORCHESTRATION SYSTEM
 * ============================
 * 
 * Advanced orchestration system that coordinates agents using the
 * AlphaGo Collective Integration for superior arbitrage performance.
 * 
 * This system manages agent teams, coordinates their actions, and ensures
 * optimal performance through advanced learning and evolution systems.
 */

import { EventEmitter } from 'events';
import { AlphaGoCollectiveIntegration } from './alphago-collective-integration.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Agent Orchestration System
 * Coordinates multiple agents using AlphaGo Collective Intelligence
 */
export class AgentOrchestrationSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Orchestration settings
            character_directories: [
                '../characters',
                '../characters/team-leaders'
            ],
            enable_team_structure: true,
            enable_role_specialization: true,
            enable_dynamic_teams: true,
            
            // Learning settings
            enable_collective_learning: true,
            learning_synchronization: 'real-time', // 'real-time', 'periodic', 'event-driven'
            
            // Performance settings
            performance_monitoring: true,
            monitoring_interval: 30000, // 30 seconds
            
            // Advanced settings
            alphago_config: {
                enable_bounded_a2c: true,
                enable_quantum_evolution: true,
                enable_quantum_mdp: true,
                enable_historical_learning: true
            },
            
            ...config
        };
        
        // Core systems
        this.alphagoCollective = null;
        
        // Agent registry
        this.agents = new Map();
        
        // Team structure
        this.teams = new Map();
        
        // System state
        this.systemState = {
            initialized: false,
            running: false,
            agents_loaded: 0,
            teams_formed: 0,
            last_action: 0,
            performance_metrics: {}
        };
        
        // Monitoring interval
        this.monitoringInterval = null;
        
        console.log('🎭 Agent Orchestration System created');
    }

    /**
     * Initialize the orchestration system
     */
    async initialize() {
        console.log('🚀 Initializing Agent Orchestration System...');
        
        try {
            // Initialize AlphaGo Collective Integration
            this.alphagoCollective = new AlphaGoCollectiveIntegration(this.config.alphago_config);
            await this.alphagoCollective.initialize();
            
            // Load agent characters
            await this.loadAgentCharacters();
            
            // Form agent teams
            if (this.config.enable_team_structure) {
                await this.formAgentTeams();
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start performance monitoring
            if (this.config.performance_monitoring) {
                this.startPerformanceMonitoring();
            }
            
            this.systemState.initialized = true;
            
            console.log(`✅ Agent Orchestration System initialized with ${this.agents.size} agents and ${this.teams.size} teams`);
            
            this.emit('system_initialized', {
                timestamp: Date.now(),
                agents_loaded: this.agents.size,
                teams_formed: this.teams.size
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize Agent Orchestration System:', error);
            throw error;
        }
    }

    /**
     * Load agent characters from character files
     */
    async loadAgentCharacters() {
        console.log('🧩 Loading agent characters...');
        
        try {
            let loadedCount = 0;
            
            // Process each character directory
            for (const dirPath of this.config.character_directories) {
                const fullPath = path.resolve(__dirname, dirPath);
                
                // Check if directory exists
                if (!fs.existsSync(fullPath)) {
                    console.warn(`⚠️ Character directory not found: ${fullPath}`);
                    continue;
                }
                
                // Read character files
                const files = fs.readdirSync(fullPath);
                const characterFiles = files.filter(file => 
                    file.endsWith('.character.json') || 
                    file.endsWith('.json')
                );
                
                // Load each character
                for (const file of characterFiles) {
                    try {
                        const characterPath = path.join(fullPath, file);
                        const characterData = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
                        
                        // Check if it's a valid character file
                        if (!characterData.id || !characterData.name) {
                            console.warn(`⚠️ Invalid character file: ${file}`);
                            continue;
                        }
                        
                        // Create agent from character
                        const agent = this.createAgentFromCharacter(characterData, file);
                        
                        // Register with collective
                        if (this.alphagoCollective) {
                            this.alphagoCollective.registerAgent(
                                agent.id,
                                agent.type,
                                { character_file: file }
                            );
                        }
                        
                        this.agents.set(agent.id, agent);
                        loadedCount++;
                        
                    } catch (error) {
                        console.error(`❌ Failed to load character ${file}:`, error);
                    }
                }
            }
            
            this.systemState.agents_loaded = loadedCount;
            console.log(`✅ Loaded ${loadedCount} agent characters`);
            
        } catch (error) {
            console.error('❌ Failed to load agent characters:', error);
            throw error;
        }
    }

    /**
     * Create agent object from character data
     */
    createAgentFromCharacter(characterData, filename) {
        // Extract agent type from filename or character data
        let agentType = 'generic';
        
        if (filename.includes('analyst')) agentType = 'analyst';
        else if (filename.includes('spotter')) agentType = 'spotter';
        else if (filename.includes('executor')) agentType = 'executor';
        else if (filename.includes('intel')) agentType = 'intelligence';
        else if (filename.includes('leader')) agentType = 'leader';
        
        // Override with character data if available
        if (characterData.type) agentType = characterData.type;
        
        // Create agent object
        const agent = {
            id: characterData.id,
            name: characterData.name,
            type: agentType,
            character: characterData,
            filename: filename,
            team: null,
            role: null,
            state: {
                active: false,
                last_action: 0,
                actions_performed: 0,
                decisions_made: 0
            },
            performance: {
                success_rate: 0,
                avg_reward: 0,
                total_reward: 0
            },
            specializations: characterData.specializations || [],
            capabilities: characterData.capabilities || []
        };
        
        return agent;
    }

    /**
     * Form agent teams based on character data
     */
    async formAgentTeams() {
        console.log('👥 Forming agent teams...');
        
        try {
            // Find team leaders
            const leaders = Array.from(this.agents.values())
                .filter(agent => agent.type === 'leader' || agent.character.isTeamLeader);
            
            if (leaders.length === 0) {
                console.warn('⚠️ No team leaders found, creating default team');
                
                // Create default team
                const defaultTeam = {
                    id: 'default_team',
                    name: 'Default Team',
                    leader: null,
                    members: [],
                    specialization: 'general',
                    performance: {
                        success_rate: 0,
                        avg_reward: 0,
                        total_actions: 0
                    }
                };
                
                // Add all agents to default team
                for (const agent of this.agents.values()) {
                    defaultTeam.members.push(agent.id);
                    agent.team = defaultTeam.id;
                }
                
                this.teams.set(defaultTeam.id, defaultTeam);
                this.systemState.teams_formed = 1;
                
            } else {
                // Create teams around leaders
                for (const leader of leaders) {
                    const team = {
                        id: `team_${leader.id}`,
                        name: leader.character.teamName || `${leader.name}'s Team`,
                        leader: leader.id,
                        members: [leader.id],
                        specialization: leader.character.teamSpecialization || 'general',
                        performance: {
                            success_rate: 0,
                            avg_reward: 0,
                            total_actions: 0
                        }
                    };
                    
                    // Set leader's team
                    leader.team = team.id;
                    leader.role = 'leader';
                    
                    // Find team members based on leader's preferences
                    if (leader.character.teamAgentIds && Array.isArray(leader.character.teamAgentIds)) {
                        for (const memberId of leader.character.teamAgentIds) {
                            if (this.agents.has(memberId) && memberId !== leader.id) {
                                team.members.push(memberId);
                                const member = this.agents.get(memberId);
                                member.team = team.id;
                            }
                        }
                    }
                    
                    // If team is too small, add compatible agents
                    if (team.members.length < 3) {
                        this.addCompatibleAgentsToTeam(team, leader);
                    }
                    
                    // Assign roles within team
                    this.assignTeamRoles(team);
                    
                    this.teams.set(team.id, team);
                }
                
                this.systemState.teams_formed = this.teams.size;
            }
            
            console.log(`✅ Formed ${this.teams.size} agent teams`);
            
        } catch (error) {
            console.error('❌ Failed to form agent teams:', error);
            throw error;
        }
    }

    /**
     * Add compatible agents to a team
     */
    addCompatibleAgentsToTeam(team, leader) {
        // Find agents without a team
        const unassignedAgents = Array.from(this.agents.values())
            .filter(agent => !agent.team);
        
        // Sort by compatibility with leader
        const sortedAgents = unassignedAgents.sort((a, b) => {
            const aCompat = this.calculateAgentCompatibility(leader, a);
            const bCompat = this.calculateAgentCompatibility(leader, b);
            return bCompat - aCompat; // Higher compatibility first
        });
        
        // Add most compatible agents until team has enough members
        for (const agent of sortedAgents) {
            if (team.members.length >= 5) break; // Maximum team size
            
            team.members.push(agent.id);
            agent.team = team.id;
        }
    }

    /**
     * Calculate compatibility between two agents
     */
    calculateAgentCompatibility(agent1, agent2) {
        let compatibility = 0;
        
        // Check for complementary specializations
        const specializations1 = new Set(agent1.specializations);
        const specializations2 = new Set(agent2.specializations);
        
        // Different specializations are good
        const differentSpecs = [...specializations2].filter(s => !specializations1.has(s));
        compatibility += differentSpecs.length * 0.2;
        
        // Check for complementary capabilities
        const capabilities1 = new Set(agent1.capabilities);
        const capabilities2 = new Set(agent2.capabilities);
        
        // Different capabilities are good
        const differentCaps = [...capabilities2].filter(c => !capabilities1.has(c));
        compatibility += differentCaps.length * 0.15;
        
        // Check for type compatibility
        if (agent1.type === 'leader' && 
            (agent2.type === 'analyst' || agent2.type === 'spotter' || agent2.type === 'executor')) {
            compatibility += 0.3;
        }
        
        // Check for explicit preferences
        if (agent1.character.preferredPartners && 
            agent1.character.preferredPartners.includes(agent2.id)) {
            compatibility += 0.5;
        }
        
        return compatibility;
    }

    /**
     * Assign roles within a team
     */
    assignTeamRoles(team) {
        // Leader already has role assigned
        const members = team.members
            .filter(id => id !== team.leader)
            .map(id => this.agents.get(id));
        
        // Count agents by type
        const typeCounts = {};
        members.forEach(agent => {
            typeCounts[agent.type] = (typeCounts[agent.type] || 0) + 1;
        });
        
        // Assign roles based on type and specializations
        members.forEach(agent => {
            switch (agent.type) {
                case 'spotter':
                    agent.role = 'opportunity_detection';
                    break;
                case 'analyst':
                    agent.role = 'analysis';
                    break;
                case 'executor':
                    agent.role = 'execution';
                    break;
                case 'intelligence':
                    agent.role = 'intelligence';
                    break;
                default:
                    // Assign based on specializations
                    if (agent.specializations.includes('risk_management')) {
                        agent.role = 'risk_management';
                    } else if (agent.specializations.includes('market_analysis')) {
                        agent.role = 'market_analysis';
                    } else {
                        agent.role = 'support';
                    }
            }
        });
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // AlphaGo Collective events
        if (this.alphagoCollective) {
            this.alphagoCollective.on('training_completed', (data) => {
                this.handleTrainingCompleted(data);
            });
            
            this.alphagoCollective.on('evolution_completed', (data) => {
                this.handleEvolutionCompleted(data);
            });
        }
    }

    /**
     * Start the orchestration system
     */
    async start() {
        if (!this.systemState.initialized) {
            await this.initialize();
        }
        
        console.log('▶️ Starting Agent Orchestration System...');
        
        // Start AlphaGo Collective
        if (this.alphagoCollective) {
            await this.alphagoCollective.start();
        }
        
        // Activate all agents
        for (const agent of this.agents.values()) {
            agent.state.active = true;
        }
        
        this.systemState.running = true;
        this.systemState.last_action = Date.now();
        
        this.emit('system_started', {
            timestamp: Date.now(),
            active_agents: this.countActiveAgents()
        });
        
        console.log(`✅ Agent Orchestration System started with ${this.countActiveAgents()} active agents`);
    }

    /**
     * Stop the orchestration system
     */
    async stop() {
        console.log('⏹️ Stopping Agent Orchestration System...');
        
        // Stop AlphaGo Collective
        if (this.alphagoCollective) {
            await this.alphagoCollective.stop();
        }
        
        // Deactivate all agents
        for (const agent of this.agents.values()) {
            agent.state.active = false;
        }
        
        // Stop performance monitoring
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        this.systemState.running = false;
        
        this.emit('system_stopped', {
            timestamp: Date.now()
        });
        
        console.log('✅ Agent Orchestration System stopped');
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        this.monitoringInterval = setInterval(() => {
            this.monitorPerformance();
        }, this.config.monitoring_interval);
        
        console.log(`📊 Performance monitoring started (${this.config.monitoring_interval}ms interval)`);
    }

    /**
     * Monitor system performance
     */
    monitorPerformance() {
        try {
            // Calculate agent performance metrics
            const agentMetrics = {};
            
            for (const [agentId, agent] of this.agents.entries()) {
                if (!agent.state.active) continue;
                
                agentMetrics[agentId] = {
                    actions_performed: agent.state.actions_performed,
                    decisions_made: agent.state.decisions_made,
                    success_rate: agent.performance.success_rate,
                    avg_reward: agent.performance.avg_reward
                };
            }
            
            // Calculate team performance metrics
            const teamMetrics = {};
            
            for (const [teamId, team] of this.teams.entries()) {
                teamMetrics[teamId] = {
                    members: team.members.length,
                    success_rate: team.performance.success_rate,
                    avg_reward: team.performance.avg_reward,
                    total_actions: team.performance.total_actions
                };
            }
            
            // Update system state
            this.systemState.performance_metrics = {
                timestamp: Date.now(),
                agent_metrics: agentMetrics,
                team_metrics: teamMetrics,
                system_metrics: this.calculateSystemMetrics()
            };
            
            // Trigger evolution if needed
            if (this.alphagoCollective && this.config.enable_collective_learning) {
                this.alphagoCollective.triggerEvolution(agentMetrics);
            }
            
            this.emit('performance_monitored', {
                timestamp: Date.now(),
                metrics: this.systemState.performance_metrics
            });
            
        } catch (error) {
            console.error('❌ Performance monitoring error:', error);
        }
    }

    /**
     * Calculate system-wide metrics
     */
    calculateSystemMetrics() {
        // Calculate overall system performance
        let totalActions = 0;
        let totalReward = 0;
        let activeAgents = 0;
        
        for (const agent of this.agents.values()) {
            if (!agent.state.active) continue;
            
            totalActions += agent.state.actions_performed;
            totalReward += agent.performance.total_reward;
            activeAgents++;
        }
        
        return {
            active_agents: activeAgents,
            total_actions: totalActions,
            avg_reward_per_agent: activeAgents > 0 ? totalReward / activeAgents : 0,
            system_uptime: process.uptime(),
            memory_usage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
        };
    }

    /**
     * Process agent action
     */
    async processAgentAction(agentId, action, state) {
        if (!this.systemState.running) {
            throw new Error('System not running');
        }
        
        if (!this.agents.has(agentId)) {
            throw new Error(`Agent ${agentId} not found`);
        }
        
        const agent = this.agents.get(agentId);
        
        if (!agent.state.active) {
            throw new Error(`Agent ${agentId} is not active`);
        }
        
        // Update agent state
        agent.state.last_action = Date.now();
        agent.state.actions_performed++;
        
        // Update team performance
        if (agent.team && this.teams.has(agent.team)) {
            const team = this.teams.get(agent.team);
            team.performance.total_actions++;
        }
        
        this.systemState.last_action = Date.now();
        
        // Use collective intelligence for decision making
        if (this.alphagoCollective && action.requires_decision) {
            try {
                const decision = await this.alphagoCollective.makeDecision(
                    agentId,
                    state,
                    action.possible_actions
                );
                
                agent.state.decisions_made++;
                
                return {
                    success: true,
                    decision,
                    agent_id: agentId,
                    timestamp: Date.now()
                };
            } catch (error) {
                console.error(`❌ Decision making failed for agent ${agentId}:`, error);
                
                return {
                    success: false,
                    error: error.message,
                    agent_id: agentId,
                    timestamp: Date.now()
                };
            }
        }
        
        // For non-decision actions
        return {
            success: true,
            action_processed: true,
            agent_id: agentId,
            timestamp: Date.now()
        };
    }

    /**
     * Record agent experience
     */
    async recordAgentExperience(agentId, experience) {
        if (!this.systemState.running) {
            throw new Error('System not running');
        }
        
        if (!this.agents.has(agentId)) {
            throw new Error(`Agent ${agentId} not found`);
        }
        
        const agent = this.agents.get(agentId);
        
        // Update agent performance
        if (experience.reward !== undefined) {
            agent.performance.total_reward += experience.reward;
            
            // Update success rate
            const isSuccess = experience.reward > 0;
            const newSuccessCount = agent.performance.success_rate * agent.state.actions_performed + (isSuccess ? 1 : 0);
            agent.performance.success_rate = newSuccessCount / (agent.state.actions_performed + 1);
            
            // Update average reward
            agent.performance.avg_reward = agent.performance.total_reward / agent.state.actions_performed;
            
            // Update team performance
            if (agent.team && this.teams.has(agent.team)) {
                const team = this.teams.get(agent.team);
                team.performance.avg_reward = (team.performance.avg_reward * team.performance.total_actions + experience.reward) / (team.performance.total_actions + 1);
            }
        }
        
        // Add experience to collective learning
        if (this.alphagoCollective && this.config.enable_collective_learning) {
            await this.alphagoCollective.addExperience(agentId, experience);
        }
        
        return {
            success: true,
            experience_recorded: true,
            agent_id: agentId,
            timestamp: Date.now()
        };
    }

    /**
     * Get agent by ID
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }

    /**
     * Get team by ID
     */
    getTeam(teamId) {
        return this.teams.get(teamId);
    }

    /**
     * Get agents by role
     */
    getAgentsByRole(role) {
        return Array.from(this.agents.values())
            .filter(agent => agent.role === role);
    }

    /**
     * Get agents by team
     */
    getAgentsByTeam(teamId) {
        return Array.from(this.agents.values())
            .filter(agent => agent.team === teamId);
    }

    /**
     * Count active agents
     */
    countActiveAgents() {
        return Array.from(this.agents.values())
            .filter(agent => agent.state.active)
            .length;
    }

    /**
     * Handle training completed event
     */
    handleTrainingCompleted(data) {
        // Update system state
        this.systemState.performance_metrics.last_training = {
            timestamp: data.timestamp,
            training_step: data.training_step,
            metrics: data.metrics
        };
        
        this.emit('training_completed', {
            timestamp: Date.now(),
            training_step: data.training_step,
            metrics: data.metrics
        });
    }

    /**
     * Handle evolution completed event
     */
    handleEvolutionCompleted(data) {
        // Update system state
        this.systemState.performance_metrics.last_evolution = {
            timestamp: data.timestamp,
            metrics: data.metrics
        };
        
        this.emit('evolution_completed', {
            timestamp: Date.now(),
            metrics: data.metrics
        });
    }

    /**
     * Get system status
     */
    getSystemStatus() {
        return {
            system_state: this.systemState,
            agent_count: this.agents.size,
            active_agents: this.countActiveAgents(),
            team_count: this.teams.size,
            alphago_status: this.alphagoCollective ? this.alphagoCollective.getSystemStatus() : null,
            performance_metrics: this.systemState.performance_metrics,
            memory_usage: process.memoryUsage(),
            uptime: process.uptime()
        };
    }
}

export default AgentOrchestrationSystem; 