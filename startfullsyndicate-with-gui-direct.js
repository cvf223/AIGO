#!/usr/bin/env node

/**
 * 🚀 DIRECT AIGO-SYNDICATE INTEGRATION WITH REAL ORCHESTRATOR CLASSES
 * ===================================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION:
 * - Direct import of ConstructionSyndicateOrchestrator 
 * - Direct import of LLMJudgeCentralNervousSystem
 * - Real-time GUI connection to live orchestrator data
 * - Proper system integration with actual running classes
 * 
 * This connects the GUI to the REAL orchestrator instances!
 */

import { EventEmitter } from 'events';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// 🏗️ IMPORT REAL ORCHESTRATOR CLASSES
import { ConstructionSyndicateOrchestrator } from './src/construction/ConstructionSyndicateOrchestrator.js';
import { LLMJudgeCentralNervousSystem } from './src/core/LLMJudgeCentralNervousSystem.js';

// 🌐 GUI COMPONENTS
import { getConstructionGUIServer } from './src/web/construction-gui-server.js';
import { DatabasePoolManager } from './src/database/DatabasePoolManager.js';
import { SmartDataStorageManager } from './src/training/SmartDataStorageManager.js';
import { SystemIntegrationBridge } from './src/web/SystemIntegrationBridge.js';

/**
 * 🚀 DIRECT AIGO-SYNDICATE WITH REAL ORCHESTRATORS
 */
class DirectAIGOSyndicateWithGUI extends EventEmitter {
    constructor() {
        super();
        
        // 🏗️ REAL ORCHESTRATOR INSTANCES
        this.constructionOrchestrator = null;
        this.centralNervousSystem = null;
        
        // 🌐 GUI COMPONENTS
        this.constructionGUIServer = null;
        this.systemBridge = null;
        this.dbPool = null;
        this.smartDataStorage = null;
        
        // 🔄 SYSTEM STATE
        this.isInitialized = false;
        this.isRunning = false;
        
        console.log('🚀 DirectAIGOSyndicateWithGUI initialized - Ready for real orchestrator connection');
    }
    
    async initialize() {
        console.log('🚀 Initializing DIRECT AIGO-Syndicate with REAL orchestrator classes...');
        
        try {
            // 🗄️ STEP 1: Initialize Database Pool Manager
            console.log('🗄️ Step 1: Initializing Database Pool Manager...');
            this.dbPool = DatabasePoolManager.getInstance();
            await this.dbPool.initialize();
            console.log('✅ Database Pool Manager initialized');
            
            // 💾 STEP 2: Initialize Smart Data Storage Manager  
            console.log('💾 Step 2: Initializing Smart Data Storage Manager...');
            this.smartDataStorage = new SmartDataStorageManager({
                ram: { maxSizeGB: 20, retentionDays: 7 },
                ssd: { maxSizeGB: 200, retentionDays: 90 }
            });
            await this.smartDataStorage.initialize();
            console.log('✅ Smart Data Storage Manager initialized');
            
            // 🧠 STEP 3: Initialize LLMJudgeCentralNervousSystem (REAL MASTER COORDINATOR)
            console.log('🧠 Step 3: Initializing REAL LLMJudgeCentralNervousSystem...');
            this.centralNervousSystem = new LLMJudgeCentralNervousSystem({
                judgeModel: 'qwen2.5:72b-instruct-fp16',
                judgmentConfidenceThreshold: 0.85,
                enableSFTGeneration: true,
                enableSharedMemory: true,
                enableAlphaGnomeSimulation: true,
                enableEnhancedContextGathering: true,
                database: {
                    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/construction_syndicate',
                    max: 200,
                    idleTimeoutMs: 300000
                }
            });
            
            // Initialize with available dependencies
            await this.centralNervousSystem.initialize({
                llmService: null, // Will be set when available
                ollamaService: null // Will be set when available  
            });
            console.log('✅ REAL LLMJudgeCentralNervousSystem initialized');
            
            // 🏗️ STEP 4: Initialize ConstructionSyndicateOrchestrator (REAL CONSTRUCTION COORDINATOR)
            console.log('🏗️ Step 4: Initializing REAL ConstructionSyndicateOrchestrator...');
            this.constructionOrchestrator = new ConstructionSyndicateOrchestrator({
                maxConcurrentPlans: 30,
                targetProcessingTime: 90000, // 1.5 minutes
                ultimatePerformanceMode: true,
                quantumProcessingAcceleration: 20,
                parallelProcessingMaxThreads: 64,
                enableQuantumEnhancements: true,
                enablePersistence: true,
                database: this.dbPool,
                serviceRegistry: null // Will be enhanced later
            });
            
            await this.constructionOrchestrator.initialize();
            console.log('✅ REAL ConstructionSyndicateOrchestrator initialized');
            
            // 🌐 STEP 5: Initialize Construction GUI Server
            console.log('🌐 Step 5: Initializing Construction GUI Server...');
            this.constructionGUIServer = getConstructionGUIServer({
                port: 3001,
                host: '0.0.0.0',
                enableWebSocket: true,
                updateInterval: 2000,
                corsOrigins: [
                    'http://localhost:3001',
                    'http://162.55.83.33:3001'
                ]
            });
            
            await this.constructionGUIServer.initialize();
            console.log('✅ Construction GUI Server initialized');
            
            // 🌉 STEP 6: Create System Integration Bridge with REAL ORCHESTRATORS
            console.log('🌉 Step 6: Creating System Integration Bridge with REAL orchestrators...');
            this.systemBridge = new SystemIntegrationBridge({
                updateInterval: 2000,
                maxRetries: 5
            });
            
            // 🔗 CONNECT TO REAL ORCHESTRATOR INSTANCES
            this.systemBridge.constructionOrchestrator = this.constructionOrchestrator;
            this.systemBridge.centralNervousSystem = this.centralNervousSystem;
            
            // Override the connectToOrchestrator method to use our real orchestrators
            await this.systemBridge.connectToRealOrchestrators(this.constructionOrchestrator, this.centralNervousSystem);
            console.log('✅ System Integration Bridge connected to REAL orchestrators');
            
            // 🔌 STEP 7: Connect Bridge Events to GUI WebSocket Broadcasting
            this.systemBridge.on('systemMetrics', (metrics) => {
                this.constructionGUIServer.broadcastToAllClients('systemMetrics', metrics);
            });
            
            this.systemBridge.on('agentThought', (thought) => {
                this.constructionGUIServer.broadcastToAllClients('agentThought', thought);
            });
            
            this.systemBridge.on('agentDecision', (decision) => {
                this.constructionGUIServer.broadcastToAllClients('agentDecision', decision);
            });
            
            this.systemBridge.on('quantumStateUpdate', (quantumData) => {
                this.constructionGUIServer.broadcastToAllClients('quantumStateUpdate', quantumData);
            });
            
            this.systemBridge.on('toolExecuted', (toolData) => {
                this.constructionGUIServer.broadcastToAllClients('toolExecuted', toolData);
            });
            
            this.systemBridge.on('instructionProcessed', (instructionData) => {
                this.constructionGUIServer.broadcastToAllClients('instructionProcessed', instructionData);
            });
            
            console.log('✅ Bridge events connected to GUI broadcasting');
            
            // 🚀 STEP 8: Start Construction GUI Server
            await this.constructionGUIServer.start();
            console.log('✅ Construction GUI Server started on port 3001');
            
            // 🎯 STEP 9: Connect GUI Server to Real Orchestrators for Human Control
            if (this.constructionGUIServer.systemBridge) {
                this.constructionGUIServer.systemBridge = this.systemBridge;
            }
            
            this.isInitialized = true;
            console.log('🎉 DIRECT AIGO-Syndicate with REAL orchestrators initialized successfully!');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize DirectAIGOSyndicateWithGUI:', error);
            throw error;
        }
    }
    
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        console.log('🚀 Starting DIRECT AIGO-Syndicate with REAL orchestrator data...');
        
        // Start real-time data collection from orchestrators
        await this.systemBridge.startDataCollection();
        
        this.isRunning = true;
        
        console.log('');
        console.log('✅ DIRECT AIGO-SYNDICATE WITH REAL ORCHESTRATORS FULLY OPERATIONAL!');
        console.log('');
        console.log('🌟 ACCESS POINTS:');
        console.log('   🌐 Ultimate GUI: http://162.55.83.33:3001');
        console.log('   🔌 WebSocket:    ws://162.55.83.33:3001');
        console.log('   📊 Health:       http://162.55.83.33:3001/health');
        console.log('');
        console.log('🎯 REAL DATA SOURCES:');
        console.log('   🏗️ ConstructionSyndicateOrchestrator: LIVE construction data');
        console.log('   🧠 LLMJudgeCentralNervousSystem: LIVE agent coordination data');
        console.log('   ⚛️ Quantum Systems: LIVE quantum state data');
        console.log('   📊 Performance Metrics: REAL system performance data');
        console.log('   🎫 Human Controls: REAL tool execution and instruction processing');
        console.log('');
        
        return this;
    }
    
    async stop() {
        console.log('🛑 Stopping DIRECT AIGO-Syndicate...');
        
        this.isRunning = false;
        
        if (this.systemBridge) {
            // Stop data collection
            this.systemBridge.stopDataCollection?.();
        }
        
        if (this.constructionGUIServer) {
            await this.constructionGUIServer.stop();
            console.log('✅ GUI Server stopped');
        }
        
        if (this.constructionOrchestrator) {
            await this.constructionOrchestrator.shutdown();
            console.log('✅ Construction Orchestrator stopped');
        }
        
        if (this.centralNervousSystem) {
            await this.centralNervousSystem.shutdown();
            console.log('✅ Central Nervous System stopped');
        }
        
        console.log('✅ DIRECT AIGO-Syndicate stopped');
    }
}

/**
 * 🚀 MAIN STARTUP FUNCTION
 */
export async function startDirectAIGOSyndicateWithGUI() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║      🚀 DIRECT AIGO-SYNDICATE + REAL ORCHESTRATORS 🚀       ║
║                                                              ║
║      Connecting GUI to LIVE orchestrator instances          ║
╚══════════════════════════════════════════════════════════════╝
`);
    
    const system = new DirectAIGOSyndicateWithGUI();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Graceful shutdown initiated...');
        await system.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Termination signal received...');
        await system.stop();
        process.exit(0);
    });
    
    try {
        await system.start();
        console.log('🎉 DIRECT AIGO-SYNDICATE WITH REAL ORCHESTRATORS FULLY OPERATIONAL!');
        return system;
    } catch (error) {
        console.error('💥 Failed to start DirectAIGOSyndicateWithGUI:', error);
        throw error;
    }
}

// Export classes for compatibility
export { DirectAIGOSyndicateWithGUI };

// If run directly, start the system
if (import.meta.url === `file://${process.argv[1]}`) {
    startDirectAIGOSyndicateWithGUI().catch(error => {
        console.error('💥 FATAL ERROR:', error);
        process.exit(1);
    });
}
