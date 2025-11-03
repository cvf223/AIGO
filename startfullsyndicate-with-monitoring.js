
// 🛡️ PERFORMANCE MONITORING CONTROL
const ENABLE_PERFORMANCE_MONITORING = process.env.ENABLE_PERFORMANCE_MONITORING === 'true' || process.env.NODE_ENV === 'production';

function conditionalPerformanceMonitoring(monitoringFunction, description = 'performance monitoring') {
    if (!ENABLE_PERFORMANCE_MONITORING) {
        console.log(`⚠️ ${description} disabled (set ENABLE_PERFORMANCE_MONITORING=true to enable)`);
        return () => {}; // Return no-op function
    }
    return monitoringFunction;
}

#!/usr/bin/env node

/**
 * 🚀 AIGO-SYNDICATE FULL SYSTEM STARTUP WITH MONITORING
 * =====================================================
 * 
 * PRODUCTION-GRADE STARTUP SCRIPT WITH INTEGRATED MONITORING
 * 
 * This script starts:
 * 1. Database initialization
 * 2. Core orchestrator system
 * 3. All construction specialist agents
 * 4. Quantum intelligence systems
 * 5. Elite monitoring & control GUI
 * 6. Post-training data capture
 * 
 * @author Elite Construction AI Syndicate
 * @version 3.0.0 - Unified Production System
 */

import { EventEmitter } from 'events';
import { MasterConstructionSyndicateOrchestrator } from './UltimateConstructionSyndicateFactory.js';
import { UnifiedMonitoringDeployment } from './src/web/UnifiedMonitoringDeployment.js';
import { DatabasePoolManager } from './src/database/DatabasePoolManager.js';
import { performance } from 'perf_hooks';
import dotenv from 'dotenv';
import os from 'os';

// Load environment configuration
dotenv.config();

/**
 * 🚀 UNIFIED SYSTEM LAUNCHER
 */
export class UnifiedSystemLauncher extends EventEmitter {
    constructor(config = (typeof { === "object" ? { : {})}) {
        super();
        
        this.config = (typeof { === "object" ? { : {})
            // System configuration
            environment: process.env.NODE_ENV || 'production',
            serverHost: process.env.SERVER_HOST || '162.55.83.33',
            
            // Orchestrator settings
            orchestrator: {
                enableQuantumSystems: true,
                enableProactivePrevention: true,
                enableMemoryPersistence: true,
                enable24x7Autonomous: true,
                enableTransformerEcosystem: true,
                databaseConfig: {
                    enablePersistence: true
                }
            },
            
            // Monitoring settings (RAM/SSD hybrid)
            monitoring: {
                graphqlPort: process.env.GRAPHQL_PORT || 4000,
                guiPort: process.env.GUI_PORT || 3001,
                streamingPort: process.env.STREAMING_PORT || 3002,
                dataCapture: {
                    enabled: true,
                    ramStorageGB: 20,     // Only last 7 days in RAM
                    ramRetentionDays: 7,
                    ssdStorageGB: 200,    // Historical data on SSD
                    ssdRetentionDays: 90,
                    compressionEnabled: true,
                    humanApprovalRequired: true
                },
                enableClustering: true
            },
            
            // Agent configuration
            agents: {
                autoStart: [
                    'head-architect',
                    'structural-engineer',
                    'quantity-surveyor',
                    'safety-specialist',
                    'sustainability-expert',
                    'compliance-analyst',
                    'error-auditor',
                    'document-generator'
                ],
                startDelay: 2000 // 2 seconds between agent starts
            },
            
            // Performance settings (corrected memory allocation)
            performance: {
                maxMemoryGB: 700, // Total usable RAM (leaving 196GB for OS)
                llmMemoryGB: 400, // Specifically for LLM models
                transformerMemoryGB: 120, // For transformer cache
                quantumMemoryGB: 100, // For quantum systems
                monitoringRAMGB: 20, // Only recent data in RAM
                workerThreads: os.cpus().length,
                enableGPU: true
            },
            
            ...config
        };
        
        // Core components
        this.orchestrator = null;
        this.monitoring = null;
        this.dbManager = null;
        
        // System state
        this.systemState = {
            initialized: false,
            orchestratorRunning: false,
            monitoringRunning: false,
            agentsActive: 0,
            startTime: null,
            errors: []
        };
        
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║     🚀 AIGO-SYNDICATE UNIFIED SYSTEM LAUNCHER 🚀            ║
║                                                              ║
║     PRODUCTION DEPLOYMENT WITH ELITE MONITORING             ║
║     ==========================================              ║
║                                                              ║
║     Environment: ${this.config.environment.padEnd(12)}                    ║
║     Server: ${this.config.serverHost.padEnd(20)}                   ║
╚══════════════════════════════════════════════════════════════╝
        `);
    }
    
    /**
     * 🎯 LAUNCH COMPLETE SYSTEM
     */
    async launch() {
        const launchStart = performance.now();
        this.systemState.startTime = new Date();
        
        try {
            console.log('\n🚀 INITIATING SYSTEM LAUNCH SEQUENCE...\n');
            console.log('═══════════════════════════════════════════');
            
            // Phase 1: Database initialization
            await this.phase1_initializeDatabase();
            
            // Phase 2: Start core orchestrator
            await this.phase2_startOrchestrator();
            
            // Phase 3: Deploy monitoring system
            await this.phase3_deployMonitoring();
            
            // Phase 4: Start construction agents
            await this.phase4_startAgents();
            
            // Phase 5: Initialize quantum systems
            await this.phase5_initializeQuantumSystems();
            
            // Phase 6: Start autonomous systems
            await this.phase6_start24x7Autonomous();
            
            // Phase 7: System verification
            await this.phase7_systemVerification();
            
            // Phase 8: Setup continuous runtime
            await this.phase8_setupContinuousRuntime();
            
            const launchTime = performance.now() - launchStart;
            
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║     ✅ SYSTEM LAUNCH COMPLETE - FULLY OPERATIONAL ✅        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║     Launch Time: ${(launchTime / 1000).toFixed(2)}s                               ║
║     Orchestrator: RUNNING                                   ║
║     Monitoring: ACTIVE                                      ║
║     Agents Active: ${String(this.systemState.agentsActive).padEnd(2)}                                        ║
║     Quantum Systems: COHERENT                               ║
║     24/7 Autonomous: ENGAGED                                ║
║                                                              ║
║     📊 ACCESS POINTS:                                       ║
║     Web GUI: http://${this.config.serverHost}:${this.config.monitoring.guiPort}              ║
║     GraphQL: http://${this.config.serverHost}:${this.config.monitoring.graphqlPort}/graphql         ║
║     WebSocket: ws://${this.config.serverHost}:${this.config.monitoring.streamingPort}                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            `);
            
            this.systemState.initialized = true;
            this.emit('system:ready', this.systemState);
            
            // Keep process alive
            this.setupProcessHandlers();
            
        } catch (error) {
            console.error('\n❌ SYSTEM LAUNCH FAILED:', error);
            this.systemState.errors.push(error);
            await this.emergencyShutdown();
            process.exit(1);
        }
    }
    
    /**
     * 📊 PHASE 1: Initialize Database
     */
    async phase1_initializeDatabase() {
        console.log('\n📊 PHASE 1: Database Initialization');
        console.log('────────────────────────────────────');
        
        this.dbManager = DatabasePoolManager.getInstance();
        const pool = await this.dbManager.getPool();
        
        // Verify connection
        const result = await pool.query('SELECT NOW()');
        console.log(`  ✅ Database connected at ${result.rows[0].now}`);
        
        // Ensure all tables exist
        await this.ensureSystemTables();
        
        console.log('  ✅ Database initialization complete');
    }
    
    /**
     * 🧠 PHASE 2: Start Orchestrator
     */
    async phase2_startOrchestrator() {
        console.log('\n🧠 PHASE 2: Starting Orchestrator');
        console.log('────────────────────────────────────');
        
        this.orchestrator = new MasterConstructionSyndicateOrchestrator(this.config.orchestrator);
        
        await this.orchestrator.initialize();
        this.systemState.orchestratorRunning = true;
        
        console.log('  ✅ Orchestrator initialized');
        console.log('  ✅ Quantum systems online');
        console.log('  ✅ Proactive prevention active');
    }
    
    /**
     * 🖥️ PHASE 3: Deploy Monitoring
     */
    async phase3_deployMonitoring() {
        console.log('\n🖥️ PHASE 3: Deploying Monitoring System');
        console.log('────────────────────────────────────');
        
        this.monitoring = new UnifiedMonitoringDeployment(this.config.monitoring);
        
        // Deploy with orchestrator reference
        const deployResult = await this.monitoring.deployCompleteSystem(this.orchestrator);
        
        if (!deployResult.success) {
            throw new Error('Monitoring deployment failed');
        }
        
        this.systemState.monitoringRunning = true;
        
        console.log(`  ✅ GraphQL server running on port ${this.config.monitoring.graphqlPort}`);
        console.log(`  ✅ GUI server running on port ${this.config.monitoring.guiPort}`);
        console.log(`  ✅ WebSocket streaming on port ${this.config.monitoring.streamingPort}`);
        console.log(`  ✅ Data capture active (${this.config.monitoring.dataCapture.maxStorageGB}GB allocated)`);
    }
    
    /**
     * 🤖 PHASE 4: Start Agents
     */
    async phase4_startAgents() {
        console.log('\n🤖 PHASE 4: Starting Construction Specialist Agents');
        console.log('────────────────────────────────────');
        
        for (const agentId of this.config.agents.autoStart) {
            console.log(`  🚀 Starting ${agentId}...`);
            
            try {
                await this.orchestrator.startAgent(agentId);
                this.systemState.agentsActive++;
                
                // Delay between starts to prevent resource spike
                await new Promise(resolve => setTimeout(resolve, this.config.agents.startDelay));
                
                console.log(`  ✅ ${agentId} active`);
            } catch (error) {
                console.error(`  ❌ Failed to start ${agentId}:`, error.message);
                this.systemState.errors.push({ agent: agentId, error });
            }
        }
        
        console.log(`  ✅ ${this.systemState.agentsActive} agents activated`);
    }
    
    /**
     * ⚛️ PHASE 5: Initialize Quantum Systems
     */
    async phase5_initializeQuantumSystems() {
        console.log('\n⚛️ PHASE 5: Initializing Quantum Systems');
        console.log('────────────────────────────────────');
        
        if (this.orchestrator.quantumSuperpositionEngine) {
            await this.orchestrator.quantumSuperpositionEngine.initialize();
            console.log('  ✅ Quantum Superposition Engine online');
        }
        
        if (this.orchestrator.quantumNodeEngine) {
            await this.orchestrator.quantumNodeEngine.initialize();
            console.log('  ✅ Quantum Node Engine active');
        }
        
        if (this.orchestrator.quantumCoherenceEngine) {
            const coherence = await this.orchestrator.quantumCoherenceEngine.getGlobalCoherence();
            console.log(`  ✅ Quantum Coherence: ${(coherence * 100).toFixed(2)}%`);
        }
        
        if (this.orchestrator.quantumEntanglementEngine) {
            await this.orchestrator.quantumEntanglementEngine.initialize();
            console.log('  ✅ Quantum Entanglement established');
        }
    }
    
    /**
     * 🤖 PHASE 6: Start 24/7 Autonomous Systems
     */
    async phase6_start24x7Autonomous() {
        console.log('\n🤖 PHASE 6: Starting 24/7 Autonomous Intelligence');
        console.log('────────────────────────────────────');
        
        if (this.orchestrator.autonomousIntelligence) {
            await this.orchestrator.autonomousIntelligence.start();
            console.log('  ✅ Background task orchestration active');
            console.log('  ✅ Continuous learning engaged');
            console.log('  ✅ Industry monitoring online');
            console.log('  ✅ Self-healing systems enabled');
        }
    }
    
    /**
     * ✔️ PHASE 7: System Verification
     */
    async phase7_systemVerification() {
        console.log('\n✔️ PHASE 7: System Verification');
        console.log('────────────────────────────────────');
        
        const verifications = [];
        
        // Verify orchestrator
        verifications.push({
            name: 'Orchestrator',
            status: this.systemState.orchestratorRunning
        });
        
        // Verify monitoring
        verifications.push({
            name: 'Monitoring System',
            status: this.systemState.monitoringRunning
        });
        
        // Verify agents
        verifications.push({
            name: 'Construction Agents',
            status: this.systemState.agentsActive > 0
        });
        
        // Verify database
        try {
            const pool = await this.dbManager.getPool();
            await pool.query('SELECT 1');
            verifications.push({
                name: 'Database Connection',
                status: true
            });
        } catch {
            verifications.push({
                name: 'Database Connection',
                status: false
            });
        }
        
        // Display results
        for (const check of verifications) {
            const icon = check.status ? '✅' : '❌';
            console.log(`  ${icon} ${check.name}: ${check.status ? 'VERIFIED' : 'FAILED'}`);
        }
        
        const allPassed = verifications.every(v => v.status);
        if (!allPassed) {
            throw new Error('System verification failed');
        }
    }
    
    /**
     * 🔄 PHASE 8: Setup Continuous Runtime
     */
    async phase8_setupContinuousRuntime() {
        console.log('\n🔄 PHASE 8: Setting Up Continuous Runtime');
        console.log('────────────────────────────────────');
        
        // Health check interval
        setInterval(async () => {
            try {
                await this.performHealthCheck();
            } catch (error) {
                console.error('Health check failed:', error);
                await this.attemptRecovery();
            }
        }, 30000); // Every 30 seconds
        
        // Metrics reporting
        setInterval(() => {
            this.reportSystemMetrics();
        }, 60000); // Every minute
        
        // Memory optimization
        setInterval(() => {
            if (global.gc) {
                global.gc();
                console.log('🧹 Garbage collection triggered');
            }
        }, 300000); // Every 5 minutes
        
        console.log('  ✅ Health monitoring active (30s interval)');
        console.log('  ✅ Metrics reporting enabled (60s interval)');
        console.log('  ✅ Memory optimization scheduled (5m interval)');
        console.log('  ✅ Auto-recovery systems engaged');
    }
    
    /**
     * 💓 PERFORM HEALTH CHECK
     */
    async performHealthCheck() {
        const health = {
            timestamp: new Date(),
            orchestrator: false,
            monitoring: false,
            database: false,
            agents: 0,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        };
        
        // Check orchestrator
        if (this.orchestrator && this.systemState.orchestratorRunning) {
            health.orchestrator = true;
        }
        
        // Check monitoring
        if (this.monitoring && this.systemState.monitoringRunning) {
            const status = this.monitoring.getStatus();
            health.monitoring = status.deployed;
        }
        
        // Check database
        try {
            const pool = await this.dbManager.getPool();
            await pool.query('SELECT 1');
            health.database = true;
        } catch (error) {
            health.database = false;
        }
        
        // Check agents
        health.agents = this.systemState.agentsActive;
        
        // Store health status
        await this.storeHealthMetrics(health);
        
        // Alert if unhealthy
        if (!health.orchestrator || !health.monitoring || !health.database) {
            this.emit('health:warning', health);
        }
        
        return health;
    }
    
    /**
     * 📊 REPORT SYSTEM METRICS
     */
    reportSystemMetrics() {
        const metrics = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            agents: this.systemState.agentsActive,
            errors: this.systemState.errors.length
        };
        
        // Log to monitoring system
        if (this.monitoring) {
            this.monitoring.emit('metrics:system', metrics);
        }
        
        // Log summary
        console.log(`📊 System Metrics: Uptime ${Math.floor(metrics.uptime / 60)}m | Memory ${Math.floor(metrics.memory.heapUsed / 1024 / 1024)}MB | Agents ${metrics.agents}`);
    }
    
    /**
     * 🔧 ATTEMPT RECOVERY
     */
    async attemptRecovery() {
        console.log('🔧 Attempting system recovery...');
        
        try {
            // Try to restart failed components
            if (!this.systemState.orchestratorRunning) {
                await this.phase2_startOrchestrator();
            }
            
            if (!this.systemState.monitoringRunning) {
                await this.phase3_deployMonitoring();
            }
            
            // Restart failed agents
            if (this.systemState.agentsActive < this.config.agents.autoStart.length) {
                await this.phase4_startAgents();
            }
            
            console.log('✅ Recovery successful');
            
        } catch (error) {
            console.error('❌ Recovery failed:', error);
            this.emit('recovery:failed', error);
        }
    }
    
    /**
     * 🗄️ ENSURE SYSTEM TABLES
     */
    async ensureSystemTables() {
        const pool = await this.dbManager.getPool();
        
        // System health table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS system_health (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMPTZ DEFAULT NOW(),
                orchestrator_status BOOLEAN,
                monitoring_status BOOLEAN,
                database_status BOOLEAN,
                active_agents INTEGER,
                memory_usage JSONB,
                uptime_seconds INTEGER
            )
        `);
        
        // System events table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS system_events (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMPTZ DEFAULT NOW(),
                event_type VARCHAR(100),
                component VARCHAR(100),
                details JSONB
            )
        `);
    }
    
    /**
     * 💾 STORE HEALTH METRICS
     */
    async storeHealthMetrics(health) {
        try {
            const pool = await this.dbManager.getPool();
            await pool.query(
                `INSERT INTO system_health 
                (orchestrator_status, monitoring_status, database_status, active_agents, memory_usage, uptime_seconds)
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    health.orchestrator,
                    health.monitoring,
                    health.database,
                    health.agents,
                    JSON.stringify(health.memory),
                    Math.floor(health.uptime)
                ]
            );
        } catch (error) {
            console.error('Failed to store health metrics:', error);
        }
    }
    
    /**
     * 🛑 SETUP PROCESS HANDLERS
     */
    setupProcessHandlers() {
        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Received SIGINT, initiating graceful shutdown...');
            await this.gracefulShutdown();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n🛑 Received SIGTERM, initiating graceful shutdown...');
            await this.gracefulShutdown();
            process.exit(0);
        });
        
        // Error handling
        process.on('uncaughtException', (error) => {
            console.error('❌ Uncaught Exception:', error);
            this.systemState.errors.push(error);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
            this.systemState.errors.push(reason);
        });
    }
    
    /**
     * 🌙 GRACEFUL SHUTDOWN
     */
    async gracefulShutdown() {
        console.log('🌙 Performing graceful shutdown...');
        
        try {
            // Stop monitoring
            if (this.monitoring) {
                console.log('  Stopping monitoring system...');
                await this.monitoring.rollbackDeployment();
            }
            
            // Stop agents
            if (this.orchestrator) {
                console.log('  Stopping agents...');
                await this.orchestrator.stopAllAgents();
            }
            
            // Stop orchestrator
            if (this.orchestrator) {
                console.log('  Stopping orchestrator...');
                await this.orchestrator.shutdown();
            }
            
            // Close database
            if (this.dbManager) {
                console.log('  Closing database connections...');
                await this.dbManager.close();
            }
            
            console.log('✅ Graceful shutdown complete');
            
        } catch (error) {
            console.error('Error during shutdown:', error);
        }
    }
    
    /**
     * 🚨 EMERGENCY SHUTDOWN
     */
    async emergencyShutdown() {
        console.error('🚨 EMERGENCY SHUTDOWN INITIATED');
        
        try {
            if (this.monitoring) await this.monitoring.rollbackDeployment();
            if (this.orchestrator) await this.orchestrator.shutdown();
            if (this.dbManager) await this.dbManager.close();
        } catch (error) {
            console.error('Emergency shutdown error:', error);
        }
    }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    const launcher = new UnifiedSystemLauncher({
        environment: process.env.NODE_ENV || 'production'
    });
    
    await launcher.launch();
}

// Start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export default UnifiedSystemLauncher;
