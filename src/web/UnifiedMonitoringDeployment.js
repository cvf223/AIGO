#!/usr/bin/env node

/**
 * 🚀 UNIFIED MONITORING DEPLOYMENT - ELITE PRODUCTION SYSTEM
 * ==========================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION FOR COMPLETE MONITORING DEPLOYMENT
 * 
 * This system provides:
 * - Unified deployment of GraphQL + WebSocket + GUI servers
 * - Orchestrator integration with real-time streaming
 * - Agent enhancement with reasoning emitters
 * - Tool executor configuration
 * - Post-training data capture optimization
 * 
 * @author Elite Construction AI Syndicate
 * @version 2.0.0 - Production Powerhouse
 */

import { EventEmitter } from 'events';
import { GraphQLConstructionServer } from './GraphQLConstructionServer.js';
import { StreamingGateway } from './StreamingGateway.js';
import { ConstructionGUIServer } from './construction-gui-server.js';
import { ReasoningEventEmitter } from '../agents/ReasoningEventEmitter.js';
import { ToolControlGateway } from './ToolControlGateway.js';
import { SmartDataStorageManager } from '../training/SmartDataStorageManager.js';
import { DatabasePoolManager } from '../database/DatabasePoolManager.js';
import { getUnifiedDatabase } from '../database/UnifiedDatabaseConfig.js';
import { performance } from 'perf_hooks';
import os from 'os';
import { createServer } from 'http';

/**
 * 🚀 UNIFIED MONITORING DEPLOYMENT SYSTEM
 */
export class UnifiedMonitoringDeployment extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Server ports
            graphqlPort: config.graphqlPort || 4000,
            guiPort: config.guiPort || 3001,
            streamingPort: config.streamingPort || 3002,
            
            // Data capture settings (RAM + SSD hybrid)
            dataCapture: {
                enabled: config.dataCapture?.enabled !== false,
                
                // RAM: Last 7 days only (20GB)
                ramStorageGB: config.dataCapture?.ramStorageGB || 20,
                ramRetentionDays: config.dataCapture?.ramRetentionDays || 7,
                
                // SSD: Historical data (200GB)
                ssdStorageGB: config.dataCapture?.ssdStorageGB || 200,
                ssdRetentionDays: config.dataCapture?.ssdRetentionDays || 90,
                
                // Capture settings
                captureThoughts: true,
                captureDecisions: true,
                captureQuantumStates: true,
                captureToolExecutions: true,
                captureInterventions: true,
                capturePerformanceMetrics: true,
                
                // Post-training optimization
                aggregationInterval: 3600000, // 1 hour
                batchSize: 1000,
                compressionRatio: 0.3 // Expect 70% compression with LZ4
            },
            
            // Performance settings
            enableClustering: config.enableClustering !== false,
            workerThreads: config.workerThreads || os.cpus().length,
            
            ...config
        };
        
        // Core components
        this.graphqlServer = null;
        this.streamingGateway = null;
        this.guiServer = null;
        this.dataCapture = null;
        this.httpServer = null;
        
        // Database
        this.dbPool = null;
        this.dbManager = null;
        
        // Orchestrator reference
        this.orchestratorRef = null;
        
        // Enhanced agents tracker
        this.enhancedAgents = new Map();
        this.enhancedExecutors = new Map();
        
        // Metrics
        this.deploymentMetrics = {
            startTime: null,
            serversRunning: 0,
            agentsEnhanced: 0,
            executorsConfigured: 0,
            dataCaptured: 0,
            storageUsedGB: 0,
            estimatedMonthlyDataGB: 0
        };
        
        console.log('🚀 Unified Monitoring Deployment System initialized');
    }
    
    /**
     * 🎯 DEPLOY COMPLETE MONITORING SYSTEM
     */
    async deployCompleteSystem(orchestratorReference) {
        console.log('🚀 DEPLOYING COMPLETE MONITORING SYSTEM...');
        console.log('================================================');
        
        const deploymentStart = performance.now();
        this.deploymentMetrics.startTime = new Date();
        this.orchestratorRef = orchestratorReference;
        
        try {
            // Phase 1: Initialize database and data capture
            console.log('\n📊 PHASE 1: Database & Data Capture');
            await this.initializeDatabase();
            await this.initializeDataCapture();
            
            // Phase 2: Deploy monitoring servers
            console.log('\n🖥️ PHASE 2: Monitoring Servers');
            await this.deployMonitoringServers();
            
            // Phase 3: Integrate with orchestrator
            console.log('\n🔗 PHASE 3: Orchestrator Integration');
            await this.integrateWithOrchestrator();
            
            // Phase 4: Enhance agents
            console.log('\n🧠 PHASE 4: Agent Enhancement');
            await this.enhanceAllAgents();
            
            // Phase 5: Configure tool executors
            console.log('\n🛠️ PHASE 5: Tool Executor Configuration');
            await this.configureToolExecutors();
            
            // Phase 6: Start data capture streams
            console.log('\n📡 PHASE 6: Data Capture Streams');
            await this.startDataCaptureStreams();
            
            // Phase 7: Calculate storage projections
            console.log('\n💾 PHASE 7: Storage Optimization');
            await this.calculateStorageProjections();
            
            const deploymentTime = performance.now() - deploymentStart;
            
            console.log('\n✅ DEPLOYMENT COMPLETE!');
            console.log('================================================');
            console.log(`⏱️ Deployment time: ${(deploymentTime / 1000).toFixed(2)}s`);
            console.log(`📊 Servers running: ${this.deploymentMetrics.serversRunning}`);
            console.log(`🧠 Agents enhanced: ${this.deploymentMetrics.agentsEnhanced}`);
            console.log(`🛠️ Executors configured: ${this.deploymentMetrics.executorsConfigured}`);
            console.log(`💾 RAM allocated: ${this.config.dataCapture.ramStorageGB}GB (last 7 days)`);
            console.log(`💾 SSD allocated: ${this.config.dataCapture.ssdStorageGB}GB (90 days total)`);
            console.log(`📈 Estimated monthly data: ${this.deploymentMetrics.estimatedMonthlyDataGB}GB`);
            
            // Emit deployment complete
            this.emit('deployment:complete', this.deploymentMetrics);
            
            return {
                success: true,
                metrics: this.deploymentMetrics,
                servers: {
                    graphql: `http://localhost:${this.config.graphqlPort}/graphql`,
                    gui: `http://localhost:${this.config.guiPort}`,
                    streaming: `ws://localhost:${this.config.streamingPort}`
                }
            };
            
        } catch (error) {
            console.error('❌ Deployment failed:', error);
            await this.rollbackDeployment();
            throw error;
        }
    }
    
    /**
     * 🗄️ INITIALIZE DATABASE
     */
    async initializeDatabase() {
        console.log('  🗄️ Initializing database connection...');
        
        this.dbManager = DatabasePoolManager.getInstance();
        this.dbPool = await this.dbManager.getPool();
        
        // Create comprehensive monitoring tables
        await this.createMonitoringTables();
        
        console.log('  ✅ Database initialized');
    }
    
    /**
     * 💾 INITIALIZE DATA CAPTURE
     */
    async initializeDataCapture() {
        console.log('  💾 Initializing post-training data capture...');
        
        this.dataCapture = new SmartDataStorageManager({
            ram: {
                maxSizeGB: this.config.dataCapture.ramStorageGB,
                retentionDays: this.config.dataCapture.ramRetentionDays
            },
            ssd: {
                maxSizeGB: this.config.dataCapture.ssdStorageGB,
                retentionDays: this.config.dataCapture.ssdRetentionDays
            }
        });
        
        await this.dataCapture.initialize();
        
        console.log('  ✅ Data capture initialized');
    }
    
    /**
     * 🖥️ DEPLOY MONITORING SERVERS
     */
    async deployMonitoringServers() {
        console.log('  🖥️ Deploying monitoring servers...');
        
        // Create shared HTTP server for WebSocket support
        this.httpServer = createServer();
        
        // 1. Deploy GraphQL server
        console.log('    📊 Starting GraphQL server...');
        this.graphqlServer = new GraphQLConstructionServer({
            port: this.config.graphqlPort,
            orchestratorReference: this.orchestratorRef
        });
        await this.graphqlServer.initialize();
        await this.graphqlServer.start();
        this.deploymentMetrics.serversRunning++;
        
        // 2. Deploy Streaming Gateway
        console.log('    📡 Starting streaming gateway...');
        this.streamingGateway = new StreamingGateway({
            enableCompression: true,
            bufferSize: 1000
        });
        await this.streamingGateway.initialize(this.httpServer);
        this.deploymentMetrics.serversRunning++;
        
        // 3. Enhance existing GUI server
        console.log('    🎨 Enhancing GUI server...');
        this.guiServer = new ConstructionGUIServer({
            port: this.config.guiPort,
            orchestratorReference: this.orchestratorRef
        });
        
        // Inject new capabilities into GUI server
        this.guiServer.graphqlServer = this.graphqlServer;
        this.guiServer.streamingGateway = this.streamingGateway;
        
        await this.guiServer.initialize();
        await this.guiServer.start();
        this.deploymentMetrics.serversRunning++;
        
        // Start shared HTTP server
        this.httpServer.listen(this.config.streamingPort);
        
        console.log('  ✅ All monitoring servers deployed');
    }
    
    /**
     * 🔗 INTEGRATE WITH ORCHESTRATOR
     */
    async integrateWithOrchestrator() {
        console.log('  🔗 Integrating with orchestrator...');
        
        if (!this.orchestratorRef) {
            console.warn('  ⚠️ No orchestrator reference provided');
            return;
        }
        
        // Connect streaming gateway to orchestrator events
        this.orchestratorRef.on('agent:thought', (data) => {
            this.streamingGateway.streamAgentThought(data.agentId, data);
            this.dataCapture.captureData('thought', data);
        });
        
        this.orchestratorRef.on('agent:decision', (data) => {
            this.streamingGateway.streamAgentDecision(data.agentId, data);
            this.dataCapture.captureData('decision', data);
        });
        
        this.orchestratorRef.on('quantum:state', (data) => {
            this.streamingGateway.streamQuantumStateChange(data.systemId, data);
            this.dataCapture.captureData('quantumState', data);
        });
        
        // Set orchestrator reference in all servers
        this.graphqlServer.orchestratorReference = this.orchestratorRef;
        this.streamingGateway.orchestratorReference = this.orchestratorRef;
        
        console.log('  ✅ Orchestrator integration complete');
    }
    
    /**
     * 🧠 ENHANCE ALL AGENTS
     */
    async enhanceAllAgents() {
        console.log('  🧠 Enhancing agents with reasoning emitters...');
        
        if (!this.orchestratorRef?.agents) {
            console.warn('  ⚠️ No agents found in orchestrator');
            return;
        }
        
        // Create reasoning emitter
        const reasoningEmitter = new ReasoningEventEmitter({
            enableQuantumReasoning: true,
            recordHistory: true
        });
        await reasoningEmitter.initialize();
        
        // Enhance each agent
        for (const [agentId, agent] of this.orchestratorRef.agents) {
            console.log(`    🎯 Enhancing agent: ${agentId}`);
            
            // Enhance with reasoning events
            reasoningEmitter.enhanceAgent(agent);
            
            // Attach to streaming gateway
            this.streamingGateway.attachToAgent(agent);
            
            // Connect to data capture
            this.connectAgentToDataCapture(agent, agentId);
            
            this.enhancedAgents.set(agentId, agent);
            this.deploymentMetrics.agentsEnhanced++;
        }
        
        // Connect reasoning emitter to streaming
        reasoningEmitter.on('reasoning:step', (data) => {
            this.streamingGateway.addToBuffer('thoughts', data);
            this.dataCapture.captureReasoningStep(data);
        });
        
        reasoningEmitter.on('decision:made', (data) => {
            this.streamingGateway.addToBuffer('decisions', data);
            this.dataCapture.captureDecision(data);
        });
        
        console.log(`  ✅ Enhanced ${this.deploymentMetrics.agentsEnhanced} agents`);
    }
    
    /**
     * 🛠️ CONFIGURE TOOL EXECUTORS
     */
    async configureToolExecutors() {
        console.log('  🛠️ Configuring tool executors...');
        
        // Initialize tool control gateway
        const toolGateway = new ToolControlGateway({
            enablePreExecutionApproval: true,
            enableRollback: true
        });
        await toolGateway.initialize();
        
        // Find and enhance executors
        if (this.orchestratorRef?.taskExecutor) {
            console.log('    🎯 Enhancing task executor');
            
            toolGateway.enhanceExecutor(this.orchestratorRef.taskExecutor);
            this.streamingGateway.attachToToolExecutor(this.orchestratorRef.taskExecutor);
            
            this.enhancedExecutors.set('main', this.orchestratorRef.taskExecutor);
            this.deploymentMetrics.executorsConfigured++;
        }
        
        // Connect tool events to streaming
        toolGateway.on('execution:start', (data) => {
            this.streamingGateway.streamToolExecutionStart(data.executorId, data.toolId, data);
            this.dataCapture.captureToolExecution(data);
        });
        
        toolGateway.on('approval:requested', (data) => {
            this.streamingGateway.addToBuffer('interventions', data);
            this.dataCapture.captureIntervention(data);
        });
        
        console.log(`  ✅ Configured ${this.deploymentMetrics.executorsConfigured} executors`);
    }
    
    /**
     * 📡 START DATA CAPTURE STREAMS
     */
    async startDataCaptureStreams() {
        console.log('  📡 Starting data capture streams...');
        
        // Connect quantum systems if available
        if (this.orchestratorRef?.quantumSystems) {
            for (const [systemId, quantumEngine] of Object.entries(this.orchestratorRef.quantumSystems)) {
                console.log(`    ⚛️ Connecting quantum system: ${systemId}`);
                this.streamingGateway.attachToQuantumSystem(systemId, quantumEngine);
            }
        }
        
        // Start periodic data aggregation
        this.startDataAggregation();
        
        // Start storage monitoring
        this.startStorageMonitoring();
        
        console.log('  ✅ Data capture streams active');
    }
    
    /**
     * 📊 CALCULATE STORAGE PROJECTIONS
     */
    async calculateStorageProjections() {
        console.log('  📊 Calculating storage projections...');
        
        // Estimate data rates based on current system
        const estimates = {
            thoughtsPerHour: this.deploymentMetrics.agentsEnhanced * 3600, // 1 per second per agent
            decisionsPerHour: this.deploymentMetrics.agentsEnhanced * 360, // 1 per 10 seconds
            quantumStatesPerHour: 1800, // 1 per 2 seconds
            toolExecutionsPerHour: 600, // 1 per 6 seconds
            performanceMetricsPerHour: 3600 // 1 per second
        };
        
        // Calculate data sizes (with compression)
        const avgSizes = {
            thought: 2 * 1024, // 2KB compressed
            decision: 5 * 1024, // 5KB compressed
            quantumState: 10 * 1024, // 10KB compressed
            toolExecution: 3 * 1024, // 3KB compressed
            performanceMetric: 1 * 1024 // 1KB compressed
        };
        
        // Calculate hourly data
        const hourlyDataBytes = 
            (estimates.thoughtsPerHour * avgSizes.thought) +
            (estimates.decisionsPerHour * avgSizes.decision) +
            (estimates.quantumStatesPerHour * avgSizes.quantumState) +
            (estimates.toolExecutionsPerHour * avgSizes.toolExecution) +
            (estimates.performanceMetricsPerHour * avgSizes.performanceMetric);
        
        const hourlyDataGB = hourlyDataBytes / (1024 * 1024 * 1024);
        const dailyDataGB = hourlyDataGB * 24;
        const monthlyDataGB = dailyDataGB * 30;
        
        this.deploymentMetrics.estimatedMonthlyDataGB = Math.round(monthlyDataGB);
        
        console.log('\n  📈 STORAGE PROJECTIONS:');
        console.log(`    Hourly: ${hourlyDataGB.toFixed(2)}GB`);
        console.log(`    Daily: ${dailyDataGB.toFixed(2)}GB`);
        console.log(`    Monthly: ${monthlyDataGB.toFixed(2)}GB`);
        console.log(`    Retention: ${this.config.dataCapture.retentionDays} days`);
        console.log(`    Total needed: ${(dailyDataGB * this.config.dataCapture.retentionDays).toFixed(2)}GB`);
        
        // Check if allocation is sufficient
        const totalNeeded = dailyDataGB * this.config.dataCapture.retentionDays;
        if (totalNeeded > this.config.dataCapture.maxStorageGB) {
            console.warn(`  ⚠️ Warning: Projected storage (${totalNeeded.toFixed(2)}GB) exceeds allocation (${this.config.dataCapture.maxStorageGB}GB)`);
            console.log(`    Adjusting sampling rate to ${(this.config.dataCapture.maxStorageGB / totalNeeded).toFixed(2)}`);
            
            this.config.dataCapture.samplingRate = this.config.dataCapture.maxStorageGB / totalNeeded;
        }
        
        return {
            hourlyGB: hourlyDataGB,
            dailyGB: dailyDataGB,
            monthlyGB: monthlyDataGB,
            retentionDays: this.config.dataCapture.retentionDays,
            totalNeededGB: totalNeeded,
            allocatedGB: this.config.dataCapture.maxStorageGB,
            samplingRate: this.config.dataCapture.samplingRate
        };
    }
    
    /**
     * 🔄 START DATA AGGREGATION
     */
    startDataAggregation() {
        setInterval(async () => {
            try {
                await this.dataCapture.aggregateHourlyData();
                await this.dataCapture.cleanupOldData(this.config.dataCapture.retentionDays);
            } catch (error) {
                console.error('Data aggregation error:', error);
            }
        }, this.config.dataCapture.aggregationInterval);
    }
    
    /**
     * 💾 START STORAGE MONITORING
     */
    startStorageMonitoring() {
        setInterval(async () => {
            const storageUsed = await this.dataCapture.getStorageUsed();
            this.deploymentMetrics.storageUsedGB = storageUsed / (1024 * 1024 * 1024);
            
            // Alert if approaching limit
            const usagePercent = (this.deploymentMetrics.storageUsedGB / this.config.dataCapture.maxStorageGB) * 100;
            if (usagePercent > 80) {
                console.warn(`⚠️ Storage usage at ${usagePercent.toFixed(1)}%`);
                this.emit('storage:warning', {
                    usedGB: this.deploymentMetrics.storageUsedGB,
                    maxGB: this.config.dataCapture.maxStorageGB,
                    percent: usagePercent
                });
            }
        }, 60000); // Check every minute
    }
    
    /**
     * 🔗 CONNECT AGENT TO DATA CAPTURE
     */
    connectAgentToDataCapture(agent, agentId) {
        // Wrap key methods to capture data
        const methodsToWrap = ['think', 'decide', 'learn', 'execute'];
        
        methodsToWrap.forEach(method => {
            const original = agent[method];
            if (typeof original === 'function') {
                agent[method] = async (...args) => {
                    const startTime = performance.now();
                    const result = await original.apply(agent, args);
                    const duration = performance.now() - startTime;
                    
                    // Capture for post-training
                    if (Math.random() < this.config.dataCapture.samplingRate) {
                        await this.dataCapture.captureAgentAction({
                            agentId,
                            method,
                            input: args,
                            output: result,
                            duration,
                            timestamp: new Date()
                        });
                    }
                    
                    return result;
                };
            }
        });
    }
    
    /**
     * 🏗️ CREATE MONITORING TABLES
     */
    async createMonitoringTables() {
        const tables = [
            // Comprehensive thought capture
            `CREATE TABLE IF NOT EXISTS monitoring_thoughts (
                id SERIAL PRIMARY KEY,
                agent_id VARCHAR(200) NOT NULL,
                thought_id VARCHAR(100) UNIQUE,
                thought TEXT NOT NULL,
                layer VARCHAR(50),
                confidence FLOAT,
                importance FLOAT,
                reasoning JSONB,
                alternatives JSONB,
                metadata JSONB,
                captured_at TIMESTAMPTZ DEFAULT NOW(),
                INDEX idx_mon_thought_agent (agent_id),
                INDEX idx_mon_thought_time (captured_at DESC),
                INDEX idx_mon_thought_confidence (confidence DESC)
            ) PARTITION BY RANGE (captured_at)`,
            
            // Decision tracking with full context
            `CREATE TABLE IF NOT EXISTS monitoring_decisions (
                id SERIAL PRIMARY KEY,
                agent_id VARCHAR(200) NOT NULL,
                decision_id VARCHAR(100) UNIQUE,
                decision JSONB NOT NULL,
                context JSONB NOT NULL,
                alternatives JSONB,
                confidence FLOAT,
                risk_assessment JSONB,
                outcome JSONB,
                captured_at TIMESTAMPTZ DEFAULT NOW(),
                INDEX idx_mon_decision_agent (agent_id),
                INDEX idx_mon_decision_time (captured_at DESC)
            ) PARTITION BY RANGE (captured_at)`,
            
            // Quantum state snapshots
            `CREATE TABLE IF NOT EXISTS monitoring_quantum_states (
                id SERIAL PRIMARY KEY,
                system_id VARCHAR(200) NOT NULL,
                state_snapshot JSONB NOT NULL,
                coherence FLOAT,
                entanglement_degree FLOAT,
                quantum_advantage FLOAT,
                visualization_data JSONB,
                captured_at TIMESTAMPTZ DEFAULT NOW(),
                INDEX idx_mon_quantum_system (system_id),
                INDEX idx_mon_quantum_time (captured_at DESC)
            ) PARTITION BY RANGE (captured_at)`,
            
            // Tool execution history
            `CREATE TABLE IF NOT EXISTS monitoring_tool_executions (
                id SERIAL PRIMARY KEY,
                executor_id VARCHAR(200) NOT NULL,
                tool_id VARCHAR(200) NOT NULL,
                execution_id VARCHAR(100) UNIQUE,
                parameters JSONB,
                result JSONB,
                duration_ms FLOAT,
                success BOOLEAN,
                error_message TEXT,
                human_approved BOOLEAN DEFAULT FALSE,
                captured_at TIMESTAMPTZ DEFAULT NOW(),
                INDEX idx_mon_tool_executor (executor_id),
                INDEX idx_mon_tool_time (captured_at DESC)
            ) PARTITION BY RANGE (captured_at)`,
            
            // Human interventions
            `CREATE TABLE IF NOT EXISTS monitoring_interventions (
                id SERIAL PRIMARY KEY,
                intervention_id VARCHAR(100) UNIQUE,
                type VARCHAR(100),
                target_id VARCHAR(200),
                human_action JSONB,
                original_action JSONB,
                reason TEXT,
                outcome JSONB,
                captured_at TIMESTAMPTZ DEFAULT NOW(),
                INDEX idx_mon_intervention_time (captured_at DESC)
            )`,
            
            // Performance metrics
            `CREATE TABLE IF NOT EXISTS monitoring_performance (
                id SERIAL PRIMARY KEY,
                component_id VARCHAR(200) NOT NULL,
                metrics JSONB NOT NULL,
                cpu_usage FLOAT,
                memory_usage FLOAT,
                latency_ms FLOAT,
                throughput FLOAT,
                captured_at TIMESTAMPTZ DEFAULT NOW(),
                INDEX idx_mon_perf_component (component_id),
                INDEX idx_mon_perf_time (captured_at DESC)
            ) PARTITION BY RANGE (captured_at)`,
            
            // Aggregated hourly data
            `CREATE TABLE IF NOT EXISTS monitoring_hourly_aggregates (
                id SERIAL PRIMARY KEY,
                hour TIMESTAMPTZ NOT NULL,
                component_id VARCHAR(200),
                metric_type VARCHAR(100),
                count BIGINT,
                avg_value FLOAT,
                min_value FLOAT,
                max_value FLOAT,
                percentile_50 FLOAT,
                percentile_95 FLOAT,
                percentile_99 FLOAT,
                UNIQUE(hour, component_id, metric_type)
            )`,
            
            // Post-training corrections
            `CREATE TABLE IF NOT EXISTS monitoring_corrections (
                id SERIAL PRIMARY KEY,
                original_event_id VARCHAR(100),
                event_type VARCHAR(100),
                original_data JSONB,
                corrected_data JSONB,
                correction_reason TEXT,
                corrected_by VARCHAR(200),
                corrected_at TIMESTAMPTZ DEFAULT NOW()
            )`
        ];
        
        // Create tables
        for (const tableSQL of tables) {
            try {
                await this.dbPool.query(tableSQL);
            } catch (error) {
                console.error('Error creating table:', error.message);
            }
        }
        
        // Create partitions for time-series data
        await this.createTablePartitions();
    }
    
    /**
     * 📅 CREATE TABLE PARTITIONS
     */
    async createTablePartitions() {
        const partitionedTables = [
            'monitoring_thoughts',
            'monitoring_decisions',
            'monitoring_quantum_states',
            'monitoring_tool_executions',
            'monitoring_performance'
        ];
        
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Create monthly partitions for next 12 months
        for (let i = 0; i < 12; i++) {
            const partitionStart = new Date(startDate);
            partitionStart.setMonth(partitionStart.getMonth() + i);
            
            const partitionEnd = new Date(partitionStart);
            partitionEnd.setMonth(partitionEnd.getMonth() + 1);
            
            const partitionName = `${partitionStart.getFullYear()}_${String(partitionStart.getMonth() + 1).padStart(2, '0')}`;
            
            for (const table of partitionedTables) {
                try {
                    await this.dbPool.query(`
                        CREATE TABLE IF NOT EXISTS ${table}_${partitionName}
                        PARTITION OF ${table}
                        FOR VALUES FROM ('${partitionStart.toISOString()}')
                        TO ('${partitionEnd.toISOString()}')
                    `);
                } catch (error) {
                    // Partition might already exist
                }
            }
        }
    }
    
    /**
     * ↩️ ROLLBACK DEPLOYMENT
     */
    async rollbackDeployment() {
        console.log('  ↩️ Rolling back deployment...');
        
        try {
            if (this.graphqlServer) await this.graphqlServer.stop();
            if (this.streamingGateway) await this.streamingGateway.stop();
            if (this.guiServer) await this.guiServer.stop();
            if (this.httpServer) this.httpServer.close();
            
            console.log('  ✅ Rollback complete');
        } catch (error) {
            console.error('  ❌ Rollback error:', error);
        }
    }
    
    /**
     * 📈 GET DEPLOYMENT STATUS
     */
    getStatus() {
        return {
            deployed: this.deploymentMetrics.serversRunning > 0,
            metrics: this.deploymentMetrics,
            storage: {
                usedGB: this.deploymentMetrics.storageUsedGB,
                allocatedGB: this.config.dataCapture.maxStorageGB,
                percentUsed: (this.deploymentMetrics.storageUsedGB / this.config.dataCapture.maxStorageGB) * 100
            },
            servers: {
                graphql: this.graphqlServer ? 'running' : 'stopped',
                streaming: this.streamingGateway ? 'running' : 'stopped',
                gui: this.guiServer ? 'running' : 'stopped'
            }
        };
    }
}

// Export for use
export default UnifiedMonitoringDeployment;
