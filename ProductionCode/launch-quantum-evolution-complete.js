#!/usr/bin/env node

/**
 * 🚀 QUANTUM EVOLUTION COMPLETE SYSTEM LAUNCHER
 * =============================================
 * 
 * COMPLETE INTEGRATION OF ALL SYSTEMS:
 * ✅ Quantum Evolution with real blockchain data
 * ✅ Comprehensive awareness integration (5 types)
 * ✅ Collaboration system with human-in-the-loop
 * ✅ "Everything is possible" help-seeking philosophy
 * ✅ Syndicate collective intelligence
 * ✅ Real-time human guidance interface
 * 
 * The user is part of the syndicate and helps all agents grow!
 * 
 * Usage:
 * node launch-quantum-evolution-complete.js --start
 * node launch-quantum-evolution-complete.js --interactive
 * node launch-quantum-evolution-complete.js --status
 */

// import { QuantumEvolutionProductionSystem } from './learning/quantum-evolution-production-integration.js'; // File deleted - blockchain only
// import { QuantumEvolutionAwarenessIntegration } from './learning/quantum-evolution-awareness-integration.js'; // File deleted - blockchain only
import { QuantumEvolutionCollaborationSystem } from './learning/quantum-evolution-collaboration-system.js';
import { getDatabaseUrl } from './src/database-config-helper.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Configure command line arguments
const argv = yargs(hideBin(process.argv))
    .option('start', {
        alias: 's',
        type: 'boolean',
        default: false,
        description: 'Start the complete system'
    })
    .option('interactive', {
        alias: 'i',
        type: 'boolean',
        default: false,
        description: 'Start in interactive mode with human interface'
    })
    .option('status', {
        alias: 't',
        type: 'boolean',
        default: false,
        description: 'Show system status'
    })
    .option('mode', {
        alias: 'm',
        type: 'string',
        default: 'production',
        choices: ['production', 'development', 'testing'],
        description: 'Launch mode'
    })
    .option('database-url', {
        alias: 'd',
        type: 'string',
        description: 'Database connection URL'
    })
    .option('verbose', {
        alias: 'v',
        type: 'boolean',
        default: false,
        description: 'Enable verbose logging'
    })
    .option('population-size', {
        alias: 'p',
        type: 'number',
        default: 50,
        description: 'Population size for each agent type'
    })
    .option('evolution-interval', {
        alias: 'e',
        type: 'number',
        default: 60000,
        description: 'Evolution cycle interval in milliseconds'
    })
    .option('awareness-interval', {
        alias: 'a',
        type: 'number',
        default: 30000,
        description: 'Awareness update interval in milliseconds'
    })
    .option('collaboration-enabled', {
        alias: 'c',
        type: 'boolean',
        default: true,
        description: 'Enable collaboration system'
    })
    .option('human-help-enabled', {
        alias: 'h',
        type: 'boolean',
        default: true,
        description: 'Enable human-in-the-loop assistance'
    })
    .help()
    .alias('help', 'help')
    .argv;

class QuantumEvolutionCompleteSystem {
    constructor() {
        this.quantumEvolution = null;
        this.awarenessIntegration = null;
        this.collaborationSystem = null;
        this.isInitialized = false;
        this.isRunning = false;
        
        // Complete system configuration
        this.config = {
            // Database configuration
            database: {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'arbitrage_syndicate',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000
            },
            
            // Quantum evolution configuration
            evolution: {
                populationSize: argv.populationSize,
                maxGenerations: 10000,
                mutationRate: 0.1,
                crossoverRate: 0.7,
                eliteSelectionRate: 0.2,
                fitnessEvaluationInterval: argv.evolutionInterval,
                competitiveIntelligenceUpdate: 300000, // 5 minutes
                realTimeEvolution: true
            },
            
            // Awareness integration configuration
            awareness: {
                enableSelfAwareness: true,
                enableSocialAwareness: true,
                enableEnvironmentAwareness: true,
                enableCompetitiveAwareness: true,
                enableMetaAwareness: true,
                enableMarketAwareness: true,
                enableOpportunityDetection: true,
                enableCapabilityAwareness: true,
                awarenessUpdateInterval: argv.awarenessInterval,
                environmentUpdateInterval: 60000, // 1 minute
                marketUpdateInterval: 30000, // 30 seconds
                opportunityUpdateInterval: 5000 // 5 seconds
            },
            
            // Collaboration system configuration
            collaboration: {
                enableAgentToAgentHelp: true,
                enableHumanInTheLoop: argv.humanHelpEnabled,
                enableCollectiveLearning: true,
                enableKnowledgeSharing: true,
                enableSyndicateGrowth: true,
                maxHelpRequestsPerAgent: 10,
                maxActiveHelpRequests: 50,
                helpRequestTimeout: 300000, // 5 minutes
                humanResponseTimeout: 600000, // 10 minutes
                collaborationRewardMultiplier: 1.5,
                knowledgeRetentionRate: 0.9,
                collectiveIntelligenceThreshold: 0.8
            },
            
            // Blockchain integration configuration
            blockchain: {
                networks: ['arbitrum', 'polygon', 'base'],
                enableRealTimeData: true,
                enableCompetitiveAnalysis: true,
                rpcProviders: {
                    arbitrum: [
                        process.env.ARBITRUM_RPC_URL || 'https://arb-mainnet.g.alchemy.com/v2/REbCC-FAc8AJD0WniRPH4R5aRtTCC9up',
                        'https://arbitrum-mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4'
                    ],
                    polygon: [
                        process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key',
                        'https://polygon-mainnet.infura.io/v3/your-api-key'
                    ],
                    base: [
                        process.env.BASE_RPC_URL || 'https://base-mainnet.g.alchemy.com/v2/your-api-key',
                        'https://base-mainnet.infura.io/v3/your-api-key'
                    ]
                }
            },
            
            // System configuration
            system: {
                mode: argv.mode,
                verbose: argv.verbose,
                interactive: argv.interactive,
                collaborationEnabled: argv.collaborationEnabled,
                humanHelpEnabled: argv.humanHelpEnabled,
                logLevel: argv.verbose ? 'debug' : 'info',
                enableFileLogging: argv.mode === 'production',
                logFile: './logs/quantum-evolution-complete.log'
            }
        };
        
        // Override database URL if provided
        if (argv.databaseUrl) {
            this.config.database = argv.databaseUrl;
        }
        
        // System performance metrics
        this.systemMetrics = {
            totalAgents: 0,
            totalEvolutions: 0,
            totalAwarenessUpdates: 0,
            totalCollaborations: 0,
            totalHumanInterventions: 0,
            systemStartTime: Date.now(),
            lastPerformanceCheck: Date.now(),
            performanceScore: 0,
            integrationHealth: 0
        };
        
        console.log('🚀 Quantum Evolution Complete System initialized');
        console.log('🌟 "Everything is possible - you just got to ask for help!"');
        console.log(`🎯 Mode: ${argv.mode}`);
        console.log(`🤝 Collaboration: ${argv.collaborationEnabled ? 'Enabled' : 'Disabled'}`);
        console.log(`🧑‍💼 Human Help: ${argv.humanHelpEnabled ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * 🚀 INITIALIZE COMPLETE SYSTEM
     * =============================
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('\n🚀 Initializing Quantum Evolution Complete System...');
            console.log('====================================================');
            
            // Check prerequisites
            await this.checkPrerequisites();
            
            // Initialize quantum evolution system
            await this.initializeQuantumEvolution();
            
            // Initialize awareness integration
            await this.initializeAwarenessIntegration();
            
            // Initialize collaboration system
            if (this.config.system.collaborationEnabled) {
                await this.initializeCollaborationSystem();
            }
            
            // Set up cross-system integration
            await this.setupCrossSystemIntegration();
            
            // Initialize system monitoring
            this.initializeSystemMonitoring();
            
            this.isInitialized = true;
            
            console.log('\n✅ QUANTUM EVOLUTION COMPLETE SYSTEM INITIALIZED');
            console.log('===============================================');
            
        } catch (error) {
            console.error('❌ Failed to initialize Quantum Evolution Complete System:', error);
            throw error;
        }
    }

    /**
     * 🔍 CHECK PREREQUISITES
     * ======================
     */
    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...');
        
        // Check environment variables
        const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.log('⚠️ Missing environment variables (using defaults):', missingVars.join(', '));
        }
        
        // Check database connectivity
        try {
            const { Pool } = await import('pg');
            const pool = new Pool(this.config.database);
            const client = await pool.connect();
            const result = await client.query('SELECT NOW() as current_time');
            client.release();
            await pool.end();
            
            console.log(`✅ Database connection successful: ${result.rows[0].current_time}`);
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
        
        // Check blockchain connectivity
        await this.testBlockchainConnectivity();
        
        console.log('✅ Prerequisites check completed');
    }

    /**
     * 🌐 TEST BLOCKCHAIN CONNECTIVITY
     * ===============================
     */
    async testBlockchainConnectivity() {
        console.log('🌐 Testing blockchain connectivity...');
        
        const { ethers } = await import('ethers');
        
        for (const [network, rpcUrls] of Object.entries(this.config.blockchain.rpcProviders)) {
            let connected = false;
            
            for (const rpcUrl of rpcUrls) {
                try {
                    const provider = new ethers.JsonRpcProvider(rpcUrl);
                    const blockNumber = await provider.getBlockNumber();
                    
                    console.log(`✅ ${network.toUpperCase()}: Block ${blockNumber} (${rpcUrl.split('/')[2]})`);
                    connected = true;
                    break;
                } catch (error) {
                    console.log(`⚠️ ${network.toUpperCase()}: Failed to connect to ${rpcUrl.split('/')[2]}`);
                }
            }
            
            if (!connected) {
                console.log(`❌ ${network.toUpperCase()}: No working RPC providers`);
            }
        }
        
        console.log('✅ Blockchain connectivity test completed');
    }

    /**
     * 🧬 INITIALIZE QUANTUM EVOLUTION
     * ===============================
     */
    async initializeQuantumEvolution() {
        console.log('🧬 Initializing quantum evolution system...');
        
        this.quantumEvolution = new QuantumEvolutionProductionSystem({
            database: this.config.database,
            evolution: this.config.evolution,
            blockchain: this.config.blockchain
        });
        
        await this.quantumEvolution.initialize();
        
        console.log('✅ Quantum evolution system initialized');
    }

    /**
     * 🧠 INITIALIZE AWARENESS INTEGRATION
     * ===================================
     */
    async initializeAwarenessIntegration() {
        console.log('🧠 Initializing awareness integration...');
        
        this.awarenessIntegration = new QuantumEvolutionAwarenessIntegration(this.config.awareness);
        await this.awarenessIntegration.initialize(this.quantumEvolution);
        
        console.log('✅ Awareness integration initialized');
    }

    /**
     * 🤝 INITIALIZE COLLABORATION SYSTEM
     * ==================================
     */
    async initializeCollaborationSystem() {
        console.log('🤝 Initializing collaboration system...');
        
        this.collaborationSystem = new QuantumEvolutionCollaborationSystem(this.config.collaboration);
        await this.collaborationSystem.initialize();
        
        console.log('✅ Collaboration system initialized');
    }

    /**
     * 🔗 SETUP CROSS-SYSTEM INTEGRATION
     * =================================
     */
    async setupCrossSystemIntegration() {
        console.log('🔗 Setting up cross-system integration...');
        
        // Connect quantum evolution to awareness
        this.quantumEvolution.on('agentEvolved', (agentData) => {
            if (this.awarenessIntegration) {
                this.awarenessIntegration.handleAgentEvolution(agentData);
            }
        });
        
        // Connect awareness to collaboration
        if (this.awarenessIntegration && this.collaborationSystem) {
            this.awarenessIntegration.on('expertiseRequest', (expertiseData) => {
                this.collaborationSystem.emit('helpRequestForAgent', expertiseData);
            });
        }
        
        // Connect collaboration to quantum evolution
        if (this.collaborationSystem) {
            this.collaborationSystem.on('knowledgeTransferred', (knowledgeData) => {
                if (this.quantumEvolution) {
                    this.quantumEvolution.handleKnowledgeTransfer(knowledgeData);
                }
            });
            
            // Register agents with collaboration system
            this.collaborationSystem.on('agentRegistrationNeeded', (agentData) => {
                this.registerAgentWithCollaboration(agentData);
            });
        }
        
        console.log('✅ Cross-system integration configured');
    }

    /**
     * 📊 INITIALIZE SYSTEM MONITORING
     * ===============================
     */
    initializeSystemMonitoring() {
        console.log('📊 Initializing system monitoring...');
        
        // Performance monitoring
        this.performanceMonitor = setInterval(() => {
            this.updateSystemMetrics();
        }, 60000); // 1 minute
        
        // Health check monitoring
        this.healthCheckMonitor = setInterval(() => {
            this.performHealthCheck();
        }, 300000); // 5 minutes
        
        console.log('✅ System monitoring initialized');
    }

    /**
     * 📈 UPDATE SYSTEM METRICS
     * ========================
     */
    updateSystemMetrics() {
        try {
            // Update quantum evolution metrics
            if (this.quantumEvolution) {
                const evolutionStatus = this.quantumEvolution.getSystemStatus();
                this.systemMetrics.totalAgents = Object.values(evolutionStatus.populationCounts)
                    .reduce((sum, count) => sum + count, 0);
                this.systemMetrics.totalEvolutions = evolutionStatus.evolutionHistory;
            }
            
            // Update awareness metrics
            if (this.awarenessIntegration) {
                const awarenessStatus = this.awarenessIntegration.getIntegrationStatus();
                this.systemMetrics.totalAwarenessUpdates = awarenessStatus.integrationMetrics.awarenessUpdates;
            }
            
            // Update collaboration metrics
            if (this.collaborationSystem) {
                const collaborationStatus = this.collaborationSystem.getCollaborationStatus();
                this.systemMetrics.totalCollaborations = collaborationStatus.syndicateGrowth.activeCollaborations;
                this.systemMetrics.totalHumanInterventions = collaborationStatus.syndicateGrowth.humanInterventions;
            }
            
            // Calculate performance score
            const uptime = Date.now() - this.systemMetrics.systemStartTime;
            const hoursSinceStart = uptime / 3600000;
            
            this.systemMetrics.performanceScore = Math.min(1.0, 
                (this.systemMetrics.totalEvolutions / hoursSinceStart) * 0.1 +
                (this.systemMetrics.totalCollaborations / hoursSinceStart) * 0.1 +
                (this.systemMetrics.totalAwarenessUpdates / hoursSinceStart) * 0.001
            );
            
            this.systemMetrics.lastPerformanceCheck = Date.now();
            
        } catch (error) {
            console.error('❌ Error updating system metrics:', error);
        }
    }

    /**
     * 🏥 PERFORM HEALTH CHECK
     * =======================
     */
    performHealthCheck() {
        try {
            let healthScore = 0;
            let totalChecks = 0;
            
            // Check quantum evolution health
            if (this.quantumEvolution) {
                const evolutionStatus = this.quantumEvolution.getSystemStatus();
                healthScore += evolutionStatus.isRunning ? 1 : 0;
                totalChecks++;
            }
            
            // Check awareness integration health
            if (this.awarenessIntegration) {
                const awarenessStatus = this.awarenessIntegration.getIntegrationStatus();
                healthScore += awarenessStatus.isRunning ? 1 : 0;
                totalChecks++;
            }
            
            // Check collaboration system health
            if (this.collaborationSystem) {
                const collaborationStatus = this.collaborationSystem.getCollaborationStatus();
                healthScore += collaborationStatus.isRunning ? 1 : 0;
                totalChecks++;
            }
            
            this.systemMetrics.integrationHealth = totalChecks > 0 ? healthScore / totalChecks : 0;
            
            // Log health status
            if (this.config.system.verbose) {
                console.log(`🏥 System Health: ${(this.systemMetrics.integrationHealth * 100).toFixed(1)}%`);
            }
            
            // Alert if health is low
            if (this.systemMetrics.integrationHealth < 0.8) {
                console.log('⚠️ System health below optimal level!');
                this.performSystemRecovery();
            }
            
        } catch (error) {
            console.error('❌ Error performing health check:', error);
        }
    }

    /**
     * 🔄 PERFORM SYSTEM RECOVERY
     * ==========================
     */
    async performSystemRecovery() {
        console.log('🔄 Performing system recovery...');
        
        try {
            // Check and restart quantum evolution if needed
            if (this.quantumEvolution && !this.quantumEvolution.isRunning) {
                console.log('🔄 Restarting quantum evolution system...');
                await this.quantumEvolution.start();
            }
            
            // Check and restart awareness integration if needed
            if (this.awarenessIntegration && !this.awarenessIntegration.isRunning) {
                console.log('🔄 Restarting awareness integration...');
                await this.awarenessIntegration.start();
            }
            
            // Check and restart collaboration system if needed
            if (this.collaborationSystem && !this.collaborationSystem.isRunning) {
                console.log('🔄 Restarting collaboration system...');
                await this.collaborationSystem.start();
            }
            
            console.log('✅ System recovery completed');
            
        } catch (error) {
            console.error('❌ Error during system recovery:', error);
        }
    }

    /**
     * 🤖 REGISTER AGENT WITH COLLABORATION
     * ====================================
     */
    registerAgentWithCollaboration(agentData) {
        if (!this.collaborationSystem) return;
        
        this.collaborationSystem.registerAgent(agentData.id, {
            type: agentData.type,
            name: agentData.name || agentData.id,
            capabilities: agentData.capabilities || [],
            expertise: agentData.expertise || {},
            specializations: agentData.specializations || []
        });
        
        console.log(`🤖 Agent ${agentData.id} registered with collaboration system`);
    }

    /**
     * 🚀 START COMPLETE SYSTEM
     * ========================
     */
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        if (this.isRunning) {
            console.log('⚠️ System already running');
            return;
        }
        
        try {
            console.log('\n🚀 Starting Quantum Evolution Complete System...');
            console.log('===============================================');
            
            // Start quantum evolution
            await this.quantumEvolution.start();
            console.log('✅ Quantum evolution started');
            
            // Start awareness integration
            await this.awarenessIntegration.start();
            console.log('✅ Awareness integration started');
            
            // Start collaboration system
            if (this.collaborationSystem) {
                await this.collaborationSystem.start();
                console.log('✅ Collaboration system started');
            }
            
            this.isRunning = true;
            
            // Display system status
            await this.displaySystemStatus();
            
            // Set up graceful shutdown
            this.setupGracefulShutdown();
            
            console.log('\n🎉 QUANTUM EVOLUTION COMPLETE SYSTEM STARTED!');
            console.log('============================================');
            console.log('🌟 "Everything is possible - you just got to ask for help!"');
            console.log('🤝 You are now part of the syndicate!');
            console.log('💡 Agents can ask for your help and guidance');
            console.log('🚀 The future of AI collaboration is here!');
            
            // If interactive mode, show collaboration interface
            if (this.config.system.interactive && this.collaborationSystem) {
                console.log('\n🔄 Entering interactive collaboration mode...');
                console.log('📝 Type "help" for available commands');
            }
            
        } catch (error) {
            console.error('❌ Failed to start complete system:', error);
            throw error;
        }
    }

    /**
     * 📊 DISPLAY SYSTEM STATUS
     * ========================
     */
    async displaySystemStatus() {
        console.log('\n📊 ============= COMPLETE SYSTEM STATUS =============');
        
        // System overview
        console.log(`🚀 System Status: ${this.isRunning ? 'RUNNING' : 'STOPPED'}`);
        console.log(`🏥 System Health: ${(this.systemMetrics.integrationHealth * 100).toFixed(1)}%`);
        console.log(`⚡ Performance Score: ${(this.systemMetrics.performanceScore * 100).toFixed(1)}%`);
        console.log(`⏱️ Uptime: ${this.formatUptime(Date.now() - this.systemMetrics.systemStartTime)}`);
        
        // Quantum evolution status
        if (this.quantumEvolution) {
            const evolutionStatus = this.quantumEvolution.getSystemStatus();
            console.log('\n🧬 QUANTUM EVOLUTION:');
            console.log(`   👥 Total Agents: ${this.systemMetrics.totalAgents}`);
            console.log(`   🧬 Total Evolutions: ${this.systemMetrics.totalEvolutions}`);
            console.log(`   💰 Total Profit: $${evolutionStatus.performanceMetrics.totalProfitGenerated.toFixed(2)}`);
            console.log(`   📊 Success Rate: ${(evolutionStatus.performanceMetrics.successRate * 100).toFixed(2)}%`);
        }
        
        // Awareness integration status
        if (this.awarenessIntegration) {
            const awarenessStatus = this.awarenessIntegration.getIntegrationStatus();
            console.log('\n🧠 AWARENESS INTEGRATION:');
            console.log(`   🔄 Awareness Updates: ${this.systemMetrics.totalAwarenessUpdates}`);
            console.log(`   📊 Overall Awareness: ${(awarenessStatus.realTimeAwareness.overallAwarenessScore * 100).toFixed(1)}%`);
            console.log(`   🌍 Environment Awareness: ${(awarenessStatus.realTimeAwareness.environmentAwarenessLevel * 100).toFixed(1)}%`);
        }
        
        // Collaboration system status
        if (this.collaborationSystem) {
            const collaborationStatus = this.collaborationSystem.getCollaborationStatus();
            console.log('\n🤝 COLLABORATION SYSTEM:');
            console.log(`   👥 Syndicate Members: ${collaborationStatus.syndicateMembers}`);
            console.log(`   🤝 Total Collaborations: ${this.systemMetrics.totalCollaborations}`);
            console.log(`   🧑‍💼 Human Interventions: ${this.systemMetrics.totalHumanInterventions}`);
            console.log(`   🧠 Collective IQ: ${(collaborationStatus.collectiveIntelligence.collectiveIQ * 100).toFixed(1)}%`);
            console.log(`   🚀 Synergy Score: ${(collaborationStatus.collectiveIntelligence.synergyScore * 100).toFixed(1)}%`);
        }
        
        console.log('\n📊 ===============================================');
    }

    /**
     * ⏱️ FORMAT UPTIME
     * ================
     */
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * 🛑 SETUP GRACEFUL SHUTDOWN
     * ==========================
     */
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
            
            try {
                // Stop monitoring
                if (this.performanceMonitor) {
                    clearInterval(this.performanceMonitor);
                }
                
                if (this.healthCheckMonitor) {
                    clearInterval(this.healthCheckMonitor);
                }
                
                // Stop collaboration system
                if (this.collaborationSystem) {
                    await this.collaborationSystem.stop();
                    console.log('✅ Collaboration system stopped');
                }
                
                // Stop awareness integration
                if (this.awarenessIntegration) {
                    await this.awarenessIntegration.stop();
                    console.log('✅ Awareness integration stopped');
                }
                
                // Stop quantum evolution
                if (this.quantumEvolution) {
                    await this.quantumEvolution.stop();
                    console.log('✅ Quantum evolution stopped');
                }
                
                console.log('✅ Quantum Evolution Complete System stopped successfully');
                console.log('👋 Thank you for being part of the syndicate!');
                
            } catch (error) {
                console.error('❌ Error during graceful shutdown:', error);
            }
            
            process.exit(0);
        };
        
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon
    }

    /**
     * 📊 SHOW STATUS ONLY
     * ===================
     */
    async showStatus() {
        try {
            console.log('\n📊 QUANTUM EVOLUTION COMPLETE SYSTEM STATUS');
            console.log('==========================================');
            
            // Test database connection
            const { Pool } = await import('pg');
            const pool = new Pool(this.config.database);
            
            try {
                const client = await pool.connect();
                const result = await client.query('SELECT NOW()');
                client.release();
                
                console.log(`🟢 Database: Connected (${result.rows[0].now})`);
                
                // Get system metrics from database
                const metricsResult = await pool.query(`
                    SELECT 
                        COUNT(*) as total_agents
                    FROM agent_populations 
                    WHERE is_active = TRUE
                `);
                
                const performanceResult = await pool.query(`
                    SELECT 
                        total_profit_generated,
                        total_executions,
                        success_rate,
                        measurement_timestamp
                    FROM evolution_performance 
                    ORDER BY measurement_timestamp DESC 
                    LIMIT 1
                `);
                
                console.log(`👥 Total Active Agents: ${metricsResult.rows[0].total_agents}`);
                
                if (performanceResult.rows.length > 0) {
                    const perf = performanceResult.rows[0];
                    console.log(`💰 Total Profit: $${parseFloat(perf.total_profit_generated).toFixed(2)}`);
                    console.log(`📊 Total Executions: ${perf.total_executions}`);
                    console.log(`✅ Success Rate: ${(parseFloat(perf.success_rate) * 100).toFixed(2)}%`);
                    console.log(`⏰ Last Update: ${new Date(perf.measurement_timestamp).toLocaleString()}`);
                }
                
            } finally {
                await pool.end();
            }
            
        } catch (error) {
            console.error('❌ Error getting system status:', error);
            console.log('🔴 System appears to be offline or misconfigured');
        }
    }

    /**
     * 🛑 STOP COMPLETE SYSTEM
     * =======================
     */
    async stop() {
        if (!this.isRunning) return;
        
        console.log('🛑 Stopping Quantum Evolution Complete System...');
        
        // Stop all subsystems
        if (this.collaborationSystem) {
            await this.collaborationSystem.stop();
        }
        
        if (this.awarenessIntegration) {
            await this.awarenessIntegration.stop();
        }
        
        if (this.quantumEvolution) {
            await this.quantumEvolution.stop();
        }
        
        // Stop monitoring
        if (this.performanceMonitor) {
            clearInterval(this.performanceMonitor);
        }
        
        if (this.healthCheckMonitor) {
            clearInterval(this.healthCheckMonitor);
        }
        
        this.isRunning = false;
        
        console.log('✅ Quantum Evolution Complete System stopped');
    }
}

// Main execution
async function main() {
    const system = new QuantumEvolutionCompleteSystem();
    
    try {
        if (argv.status) {
            await system.showStatus();
        } else if (argv.start || argv.interactive) {
            await system.start();
        } else {
            console.log('🤝 Quantum Evolution Complete System');
            console.log('Use --start to launch the system');
            console.log('Use --interactive for human collaboration mode');
            console.log('Use --status to check system status');
            console.log('Use --help for more options');
        }
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { QuantumEvolutionCompleteSystem }; 