#!/usr/bin/env node

/**
 * 🚀 QUANTUM EVOLUTION SYSTEM - PRODUCTION LAUNCHER
 * =================================================
 * 
 * Launches the quantum evolution system with REAL blockchain data integration.
 * 
 * REAL INTEGRATIONS:
 * ✅ PostgreSQL database with existing schema
 * ✅ Real arbitrage opportunity detector
 * ✅ Live blockchain price feeds
 * ✅ Real competitive intelligence
 * ✅ Actual agent performance tracking
 * 
 * Usage:
 * node launch-quantum-evolution-production.js --mode production
 * node launch-quantum-evolution-production.js --mode development
 * node launch-quantum-evolution-production.js --status
 */

// import { QuantumEvolutionProductionSystem } from './learning/quantum-evolution-production-integration.js'; // File deleted - blockchain only
import { getDatabaseUrl } from './src/database-config-helper.js';
// BLOCKCHAIN REMOVED: import { BlockchainIntegrationCapability } from './capabilities/blockchainIntegration.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Configure command line arguments
const argv = yargs(hideBin(process.argv))
    .option('mode', {
        alias: 'm',
        type: 'string',
        default: 'production',
        choices: ['production', 'development', 'testing'],
        description: 'Launch mode'
    })
    .option('status', {
        alias: 's',
        type: 'boolean',
        default: false,
        description: 'Show system status only'
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
    .option('evolution-interval', {
        alias: 'i',
        type: 'number',
        default: 60000,
        description: 'Evolution cycle interval in milliseconds'
    })
    .option('population-size', {
        alias: 'p',
        type: 'number',
        default: 50,
        description: 'Population size for each agent type'
    })
    .help()
    .alias('help', 'h')
    .argv;

class QuantumEvolutionProductionLauncher {
    constructor() {
        this.evolutionSystem = null;
        this.blockchainIntegration = null;
        this.isRunning = false;
        
        // Production configuration
        this.config = {
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
            logging: {
                level: argv.verbose ? 'debug' : 'info',
                enableFileLogging: argv.mode === 'production',
                logFile: './logs/quantum-evolution-production.log'
            }
        };
        
        // Override database URL if provided
        if (argv.databaseUrl) {
            this.config.database = argv.databaseUrl;
        }
        
        console.log('🚀 Quantum Evolution Production Launcher initialized');
        console.log(`📊 Mode: ${argv.mode}`);
        console.log(`🧬 Population size: ${argv.populationSize}`);
        console.log(`⏱️ Evolution interval: ${argv.evolutionInterval}ms`);
    }

    /**
     * 🚀 START PRODUCTION SYSTEM
     * ==========================
     */
    async start() {
        try {
            if (this.isRunning) {
                console.log('⚠️ System already running');
                return;
            }

            console.log('\n🚀 Starting Quantum Evolution Production System...');
            console.log('==================================================');
            
            // Check prerequisites
            await this.checkPrerequisites();
            
            // Initialize blockchain integration
            await this.initializeBlockchainIntegration();
            
            // Initialize evolution system
            await this.initializeEvolutionSystem();
            
            // Start the system
            await this.evolutionSystem.start();
            
            this.isRunning = true;
            
            console.log('\n✅ QUANTUM EVOLUTION PRODUCTION SYSTEM STARTED SUCCESSFULLY');
            console.log('============================================================');
            
            // Display system status
            await this.displaySystemStatus();
            
            // Set up graceful shutdown
            this.setupGracefulShutdown();
            
            // Start monitoring
            this.startMonitoring();
            
        } catch (error) {
            console.error('❌ Failed to start Quantum Evolution Production System:', error);
            process.exit(1);
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
            const testConnection = await this.testDatabaseConnection();
            console.log('✅ Database connection successful');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
        
        // Check blockchain RPC endpoints
        await this.testBlockchainConnectivity();
        
        console.log('✅ Prerequisites check completed');
    }

    /**
     * 🔗 TEST DATABASE CONNECTION
     * ===========================
     */
    async testDatabaseConnection() {
        const { Pool } = await import('pg');
        const pool = new Pool(this.config.database);
        
        try {
            const client = await pool.connect();
            const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
            client.release();
            
            console.log(`📊 Database: ${result.rows[0].current_time}`);
            console.log(`🗄️ PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
            
            return true;
        } finally {
            await pool.end();
        }
    }

    /**
     * 🌐 TEST BLOCKCHAIN CONNECTIVITY
     * ===============================
     */
    async testBlockchainConnectivity() {
        console.log('🌐 Testing blockchain connectivity...');
        
        for (const [network, rpcUrls] of Object.entries(this.config.blockchain.rpcProviders)) {
            for (const rpcUrl of rpcUrls) {
                try {
                    const { ethers } = await import('ethers');
                    const provider = new ethers.JsonRpcProvider(rpcUrl);
                    const blockNumber = await provider.getBlockNumber();
                    
                    console.log(`✅ ${network.toUpperCase()}: Block ${blockNumber} (${rpcUrl.split('/')[2]})`);
                    break; // Use first working RPC
                } catch (error) {
                    console.log(`⚠️ ${network.toUpperCase()}: Failed to connect to ${rpcUrl.split('/')[2]}`);
                }
            }
        }
    }

    /**
     * 🔗 INITIALIZE BLOCKCHAIN INTEGRATION
     * ===================================
     */
    async initializeBlockchainIntegration() {
        console.log('🔗 Initializing blockchain integration...');
        
        this.blockchainIntegration = new BlockchainIntegrationCapability();
        await this.blockchainIntegration.initialize();
        
        console.log('✅ Blockchain integration initialized');
    }

    /**
     * 🧬 INITIALIZE EVOLUTION SYSTEM
     * ==============================
     */
    async initializeEvolutionSystem() {
        console.log('🧬 Initializing quantum evolution system...');
        
        this.evolutionSystem = new QuantumEvolutionProductionSystem({
            database: this.config.database,
            evolution: this.config.evolution,
            blockchain: this.config.blockchain
        });
        
        await this.evolutionSystem.initialize();
        
        console.log('✅ Quantum evolution system initialized');
    }

    /**
     * 📊 DISPLAY SYSTEM STATUS
     * ========================
     */
    async displaySystemStatus() {
        console.log('\n📊 SYSTEM STATUS');
        console.log('================');
        
        const status = this.evolutionSystem.getSystemStatus();
        
        console.log(`🟢 System Status: ${status.isRunning ? 'RUNNING' : 'STOPPED'}`);
        console.log(`🧬 Initialized: ${status.isInitialized ? 'YES' : 'NO'}`);
        
        console.log('\n👥 AGENT POPULATIONS:');
        for (const [type, count] of Object.entries(status.populationCounts)) {
            console.log(`   ${type}: ${count} agents`);
        }
        
        console.log('\n📈 PERFORMANCE METRICS:');
        console.log(`   Total Executions: ${status.performanceMetrics.totalArbitrageExecutions}`);
        console.log(`   Total Profit: $${status.performanceMetrics.totalProfitGenerated.toFixed(2)}`);
        console.log(`   Success Rate: ${(status.performanceMetrics.successRate * 100).toFixed(2)}%`);
        console.log(`   Avg Execution Time: ${status.performanceMetrics.averageExecutionTime.toFixed(2)}ms`);
        
        console.log('\n🧠 COMPETITIVE INTELLIGENCE:');
        console.log(`   Competitors Tracked: ${status.competitiveIntelligence.competitorCount}`);
        console.log(`   Last Analysis: ${new Date(status.competitiveIntelligence.lastAnalysis).toLocaleString()}`);
        
        console.log(`\n📚 Evolution History: ${status.evolutionHistory} records`);
    }

    /**
     * 🔄 START MONITORING
     * ==================
     */
    startMonitoring() {
        console.log('\n🔄 Starting system monitoring...');
        
        // Performance monitoring
        this.monitoringInterval = setInterval(async () => {
            try {
                const status = this.evolutionSystem.getSystemStatus();
                
                // Log key metrics
                console.log(`📊 [${new Date().toISOString()}] Performance Update:`);
                console.log(`   Executions: ${status.performanceMetrics.totalArbitrageExecutions}`);
                console.log(`   Profit: $${status.performanceMetrics.totalProfitGenerated.toFixed(2)}`);
                console.log(`   Success Rate: ${(status.performanceMetrics.successRate * 100).toFixed(2)}%`);
                
                // Check for alerts
                if (status.performanceMetrics.successRate < 0.5) {
                    console.log('⚠️ WARNING: Success rate below 50%');
                }
                
                if (status.performanceMetrics.totalArbitrageExecutions === 0) {
                    console.log('⚠️ WARNING: No arbitrage executions detected');
                }
                
            } catch (error) {
                console.error('❌ Error in monitoring:', error);
            }
        }, 300000); // 5 minutes
        
        console.log('✅ System monitoring started');
    }

    /**
     * 🛑 SETUP GRACEFUL SHUTDOWN
     * ==========================
     */
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
            
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
            }
            
            if (this.evolutionSystem) {
                await this.evolutionSystem.stop();
            }
            
            console.log('✅ Quantum Evolution Production System stopped');
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
            // Check if system is running by trying to connect to database
            const testConnection = await this.testDatabaseConnection();
            
            console.log('\n📊 QUANTUM EVOLUTION SYSTEM STATUS');
            console.log('==================================');
            console.log('🟢 Database: Connected');
            
            // If we can connect, try to get more detailed status
            const { Pool } = await import('pg');
            const pool = new Pool(this.config.database);
            
            try {
                // Check population counts
                const populationResult = await pool.query(`
                    SELECT population_type, COUNT(*) as count
                    FROM agent_populations 
                    WHERE is_active = TRUE
                    GROUP BY population_type
                `);
                
                console.log('\n👥 AGENT POPULATIONS:');
                for (const row of populationResult.rows) {
                    console.log(`   ${row.population_type}: ${row.count} agents`);
                }
                
                // Check recent performance
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
                
                if (performanceResult.rows.length > 0) {
                    const perf = performanceResult.rows[0];
                    console.log('\n📈 LATEST PERFORMANCE:');
                    console.log(`   Total Profit: $${parseFloat(perf.total_profit_generated).toFixed(2)}`);
                    console.log(`   Total Executions: ${perf.total_executions}`);
                    console.log(`   Success Rate: ${(parseFloat(perf.success_rate) * 100).toFixed(2)}%`);
                    console.log(`   Last Update: ${new Date(perf.measurement_timestamp).toLocaleString()}`);
                }
                
                // Check competitive intelligence
                const competitorResult = await pool.query(`
                    SELECT COUNT(*) as count
                    FROM competitive_intelligence 
                    WHERE analysis_timestamp > NOW() - INTERVAL '24 hours'
                `);
                
                console.log('\n🧠 COMPETITIVE INTELLIGENCE:');
                console.log(`   Competitors Tracked: ${competitorResult.rows[0].count}`);
                
            } finally {
                await pool.end();
            }
            
        } catch (error) {
            console.error('❌ Error getting system status:', error);
            console.log('🔴 System appears to be offline or misconfigured');
        }
    }
}

// Main execution
async function main() {
    const launcher = new QuantumEvolutionProductionLauncher();
    
    try {
        if (argv.status) {
            await launcher.showStatus();
        } else {
            await launcher.start();
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

export { QuantumEvolutionProductionLauncher }; 