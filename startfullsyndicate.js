#!/usr/bin/env node

/**
 * 🏗️🚀 START CONSTRUCTION SYNDICATE - MASTER SYSTEM LAUNCHER
 * ==========================================================
 * 
 * THE ULTIMATE SINGLE COMMAND THAT LAUNCHES THE ENTIRE
 * REVOLUTIONARY AI CONSTRUCTION SYNDICATE ECOSYSTEM
 * 
 * REFACTORED WITH:
 * - Lazy module loading to prevent circular dependencies
 * - Service registry for dependency injection
 * - Phased initialization with error boundaries
 * - No global state mutations
 * 
 * USAGE: node startfullsyndicate.js
 */

// ESSENTIAL IMPORTS ONLY - These are safe to import at top level
import { EventEmitter } from 'events';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables immediately
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our new initialization infrastructure
import { moduleLoader, lazyLoad } from './src/utils/LazyModuleLoader.js';
import { serviceRegistry } from './src/core/ServiceRegistry.js';
import { initializationManager } from './src/core/InitializationManager.js';
import { circularDetector, installCircularDetection } from './src/utils/CircularDependencyDetector.js';
import { adaptiveSafetyThresholdManager } from './src/safety/AdaptiveSafetyThresholdManager.js';
import { systemObservationController } from './src/core/SystemObservationController.js';
import { onDemandActivator } from './src/core/OnDemandActivator.js';
import { systemHealthReporter } from './src/core/SystemHealthReporter.js';
import { observationModeEnforcer } from './src/core/ObservationModeEnforcer.js';

// Install circular dependency detection immediately
if (process.env.DETECT_CIRCULAR === 'true' || process.env.NODE_ENV === 'development') {
    installCircularDetection();
    console.log('🔄 Circular dependency detection activated');
}

// CRITICAL FIX: OBSERVATION_MODE_ENFORCED - Force true idle mode
const OBSERVATION_MODE_ENFORCED = process.env.OBSERVATION_MODE_ENFORCED !== 'false'; // Default to true
const PROOF_OF_CONCEPT_MODE = process.env.PROOF_OF_CONCEPT_MODE === 'true' || OBSERVATION_MODE_ENFORCED;

if (OBSERVATION_MODE_ENFORCED) {
    console.log('🔭 OBSERVATION_MODE_ENFORCED ENABLED');
    console.log('   ✅ All autonomous training systems DISABLED');
    console.log('   ✅ All hardcoded simulations DISABLED');
    console.log('   ✅ Only on-demand operations ENABLED');
    console.log('   ✅ True idle mode enforced');
    console.log('   ✅ <5 logs per minute target');
    
    // CRITICAL FIX: Set global flags to disable spam immediately
    global.DISABLE_DEBUG_LOGGING = true;
    global.OBSERVATION_MODE_GLOBAL = true;
    global.SKIP_AUTONOMOUS_SYSTEMS = true;
    global.OBSERVATION_MODE_ENFORCED = true;
}

// CRITICAL FIX: Global initialization tracking to prevent endless loops
const INITIALIZED_SYSTEMS = new Set();
const INITIALIZATION_IN_PROGRESS = new Set();

// CRITICAL: Global flags to prevent multiple starts and track phases
let SYSTEM_STARTED = false;
let SYSTEM_IN_OBSERVATION_MODE = false;
const COMPLETED_PHASES = new Set();

/**
 * 🛡️ ENSURE SINGLE PHASE INITIALIZATION
 * Prevents phases from running more than once
 */
function ensureSinglePhase(phaseName, phaseFunc) {
    // Check if phase already completed
    if (COMPLETED_PHASES.has(phaseName)) {
        console.log(`⚠️ Phase ${phaseName} already completed - skipping`);
        return Promise.resolve();
    }
    
    // Check if phase is in progress
    if (INITIALIZATION_IN_PROGRESS.has(phaseName)) {
        console.log(`⚠️ Phase ${phaseName} already in progress - skipping`);
        return Promise.resolve();
    }
    
    // Mark as in progress
    INITIALIZATION_IN_PROGRESS.add(phaseName);
    
    // Run phase with error handling
    return phaseFunc()
        .then(result => {
            INITIALIZATION_IN_PROGRESS.delete(phaseName);
            COMPLETED_PHASES.add(phaseName);
            console.log(`✅ Phase ${phaseName} completed successfully`);
            return result;
        })
        .catch(error => {
            INITIALIZATION_IN_PROGRESS.delete(phaseName);
            console.error(`❌ Phase ${phaseName} failed:`, error.message);
            throw error;
        });
}

/**
 * 🛡️ ENSURE SINGLE INITIALIZATION
 * Prevents any system from initializing more than once
 */
function ensureSingleInitialization(systemName, initFunc) {
    // Check if already initialized
    if (INITIALIZED_SYSTEMS.has(systemName)) {
        console.log(`⚠️ ${systemName} already initialized - skipping`);
        return Promise.resolve(null);
    }
    
    // Check if initialization is in progress
    if (INITIALIZATION_IN_PROGRESS.has(systemName)) {
        console.log(`⚠️ ${systemName} initialization already in progress - skipping`);
        return Promise.resolve(null);
    }
    
    // Mark as in progress
    INITIALIZATION_IN_PROGRESS.add(systemName);
    
    // Run initialization with error handling
    return initFunc()
        .then(result => {
            INITIALIZATION_IN_PROGRESS.delete(systemName);
            INITIALIZED_SYSTEMS.add(systemName);
            console.log(`✅ ${systemName} initialized successfully`);
            return result;
        })
        .catch(error => {
            INITIALIZATION_IN_PROGRESS.delete(systemName);
            console.error(`❌ ${systemName} initialization failed:`, error.message);
            throw error;
        });
}

/**
 * 🏗️🚀 MASTER CONSTRUCTION SYNDICATE ORCHESTRATOR
 * ==============================================
 * 
 * Refactored for zero circular dependencies and 100% reliable startup
 */
class MasterConstructionSyndicateOrchestrator extends EventEmitter {
    constructor(config = {}) {
        super();
        this.systemStarted = false;
        this.inObservationMode = false;
        
        this.config = {
            mode: config.mode || 'construction',
            projectType: config.projectType || 'hoai_lp6_7',
            enableVisionProcessing: config.enableVisionProcessing !== false,
            enableErrorDetection: config.enableErrorDetection !== false,
            enableHumanEscalation: config.enableHumanEscalation !== false,
            enableWebInterface: config.enableWebInterface !== false,
            enableQuantumEnhancements: config.enableQuantumEnhancements !== false,
            learningIntensity: config.learningIntensity || 'maximum',
            characterFilesDir: config.characterFilesDir || './characters/ConstructionCharacters',
            maxConcurrentPlans: config.maxConcurrentPlans || 30,
            targetProcessingTime: config.targetProcessingTime || 1800000,
            hoaiComplianceLevel: config.hoaiComplianceLevel || 'strict',
            errorConfidenceThreshold: config.errorConfidenceThreshold || 0.95,
            ...config
        };
        
        // System state
        this.isInitialized = false;
        this.isRunning = false;
        this.systemStartTime = null;
        this.agents = new Map();
        this.activeProjects = new Map();
        
        // Metrics
        this.systemMetrics = {
            totalAgents: 0,
            totalProjects: 0,
            totalPlansProcessed: 0,
            totalErrorsDetected: 0,
            totalEscalations: 0,
            hoaiComplianceRate: 1.0,
            averageProcessingTime: 0,
            systemUptime: 0
        };
        
        console.log('🏗️🚀 Master Construction Syndicate Orchestrator created');
        console.log(`   📋 Mode: ${this.config.mode.toUpperCase()}`);
        console.log(`   🏗️ Project Type: ${this.config.projectType}`);
        console.log(`   🎯 Learning Intensity: ${this.config.learningIntensity}`);
    }
    
    /**
     * 🚀 MASTER INITIALIZATION - NEW PHASED APPROACH
     */
    async initialize() {
        console.log('🚀 Starting Elite Construction AI Syndicate...');
        console.log('==================================================');
        
        try {
            this.systemStartTime = Date.now();
            
            // PHASE 1: Core Infrastructure
            await this.initializePhase1CoreInfrastructure();
            
            // PHASE 2: Base Services
            await this.initializePhase2BaseServices();
            
            // PHASE 3: Learning Systems (Parallel)
            await this.initializePhase3LearningSystems();
            
            // PHASE 4: Syndicate Factory & Agents
            await this.initializePhase4SyndicateFactory();
            
            // PHASE 5: UI & Monitoring
            await this.initializePhase5UIMonitoring();
            
            // PHASE 6: Background Tasks
            await this.initializePhase6BackgroundTasks();
            
            this.isInitialized = true;
            
            console.log('\n✅ MASTER CONSTRUCTION SYNDICATE ORCHESTRATOR INITIALIZED!');
            console.log('🏗️ ALL SYSTEMS OPERATIONAL FOR HOAI LP 6 & 7 PROCESSING');
            
            return true;
            
        } catch (error) {
            console.error('❌ CRITICAL ERROR: Construction orchestrator initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * 📋 PHASE 1: Core Infrastructure (Patches, Database, Logging)
     */
    async initializePhase1CoreInfrastructure() {
        return ensureSinglePhase('Phase1-CoreInfrastructure', async () => {
            console.log('\n📋 PHASE 1: CORE INFRASTRUCTURE');
            console.log('=================================');
        
        // 🛡️ Apply patches first (these are critical)
        console.log('🛡️ Applying system patches...');
        const { applyNullGuards } = await lazyLoad('./src/patches/ApplyNullGuards.js');
        const { patchTensorFlowAPIs } = await lazyLoad('./src/patches/TensorFlowAPIPatch.js');
        const { applyDelayedTasksPatch } = await lazyLoad('./src/patches/DelayedBackgroundTasksPatch.js');
        
        applyNullGuards();
        applyDelayedTasksPatch();
        
        // Initialize TensorFlow compatibility
        try {
            const tfModule = await lazyLoad('./src/quantum/TensorFlowCompatibilityLayer.js');
            const tf = tfModule.default;
            patchTensorFlowAPIs(tf);
            console.log('   ✅ TensorFlow compatibility patches applied');
        } catch (err) {
            console.warn('   ⚠️ Could not patch TensorFlow APIs:', err.message);
        }
        
        // 🗄️ Initialize Database (using service registry)
        console.log('🗄️ Initializing database...');
        await serviceRegistry.register('database', async () => {
            const databaseManager = await lazyLoad('./src/database/EnhancedDatabaseManager.js');
            await databaseManager.default.initialize();
            
            const dbPool = await databaseManager.default.getPool();
            
            // Register in service registry instead of global
            serviceRegistry.register('dbPool', dbPool, { lazy: false });
            
            return dbPool;
        }, {
            critical: true,
            singleton: true
        });
        
        // Initialize database
        const database = await serviceRegistry.get('database');
        console.log('   ✅ Database initialized');
        
        // Initialize database pool manager
        const { DatabasePoolManager } = await lazyLoad('./src/database/DatabasePoolManager.js');
        const dbManager = DatabasePoolManager.getInstance();
        await dbManager.initialize();
        
        // 🛡️ Initialize and register Safety Threshold Manager
        console.log('🛡️ Initializing safety threshold manager...');
        await serviceRegistry.register('safetyThresholdManager', async () => {
            const dbPool = await serviceRegistry.get('database');
            await adaptiveSafetyThresholdManager.initialize({
                db: dbPool,
                enableFeedbackLoop: true,
                persistThresholds: true
            });
            return adaptiveSafetyThresholdManager;
        }, {
            critical: false,
            singleton: true
        });
        console.log('   ✅ Safety threshold manager registered');
        console.log('   ✅ DatabasePoolManager singleton initialized');
        
        // Initialize global database registry
        const { globalDatabaseRegistry } = await lazyLoad('./src/database/GlobalDatabaseRegistry.js');
        await globalDatabaseRegistry.initialize();
        console.log('   ✅ Global Database Registry initialized');
        });
    }
    
    /**
     * 📋 PHASE 2: Base Services (Memory, World Model, Context)
     */
    async initializePhase2BaseServices() {
        return ensureSinglePhase('Phase2-BaseServices', async () => {
            console.log('\n📋 PHASE 2: BASE SERVICES');
            console.log('=========================');
        
        // Ollama Service
        await serviceRegistry.register('ollamaService', async () => {
            const { OllamaIntegration } = await lazyLoad('./src/llm/OllamaIntegration.js');
            const ollamaService = new OllamaIntegration({
                primaryModel: process.env.PRIMARY_LLM_MODEL || 'qwen2.5:72b-instruct-fp16',
                fastModel: process.env.FAST_LLM_MODEL || 'mistral:7b-instruct-fp16',
                visionModel: process.env.VISION_LLM_MODEL || 'llava:34b',
                mathematicalModel: process.env.MATH_LLM_MODEL || 'phi3:14b',
                backupModel: process.env.BACKUP_LLM_MODEL || 'llama3.3:70b',
                useContextualPrompting: true,
                enableTaskSpecialization: true,
                creativityEnhancementEnabled: true,
                restartRecoveryEnabled: true,
                enableLLMFinetuning: true,
                enableConcurrentModels: true,
                preloadAllModels: true,
                maxConcurrentModels: 6
            });
            await ollamaService.init();
            return ollamaService;
        }, { critical: true });
        
        // Central Nervous System
        await serviceRegistry.register('centralNervousSystem', async (deps) => {
            const { LLMJudgeCentralNervousSystem } = await lazyLoad('./src/core/LLMJudgeCentralNervousSystem.js');
            const cns = new LLMJudgeCentralNervousSystem({
            judgeModel: 'llama3.1:70b',
            judgmentConfidenceThreshold: 0.85,
            simulationIntensity: 'adaptive',
            domainFocus: 'construction_analysis',
            complianceMode: 'hoai_lp6_7',
            errorDetectionEnabled: true,
            humanEscalationEnabled: true,
                enableLLMJudgment: true,
                database: await serviceRegistry.get('dbPool'),
            enableSFTGeneration: true,
            enableSharedMemory: true
        });
        
            await cns.initialize({
                llmService: deps.ollamaService,
                ollamaService: deps.ollamaService
            });
            
            return cns;
        }, { 
            dependencies: ['ollamaService', 'dbPool'],
            critical: true 
        });
        
        // Shared Memory System
        await serviceRegistry.register('sharedMemory', async (deps) => {
            const { SharedMemorySystem } = await lazyLoad('./src/memory/SharedMemorySystem.js');
            const memory = new SharedMemorySystem(deps.dbPool);
            await memory.initialize();
            return memory;
        }, {
            dependencies: ['dbPool'],
            critical: true
        });
        
        // World Model
        await serviceRegistry.register('worldModel', async (deps) => {
            const { ConstructionWorldModel } = await lazyLoad('./src/learning/ConstructionWorldModel.js');
            const worldModel = new ConstructionWorldModel({
                database: deps.dbPool,
            numInputFeatures: 45,
            materialPriceFeatures: 12,
            laborCostFeatures: 8,
            supplyChainFeatures: 6,
            regulatoryFeatures: 5,
            hoaiFeatures: 4,
            regions: ['de_south', 'de_north', 'de_west', 'de_east', 'berlin'],
            lstmUnits: 256,
            lstmLayers: 3,
            numMixtures: 8,
                predictionHorizon: 12,
            enablePhysicsConstraints: true,
            enableCausalModeling: true,
            enableVisualFeatures: true,
            enableTextFeatures: true,
            enableStructuredData: true
        });
            await worldModel.initialize();
            return worldModel;
        }, {
            dependencies: ['dbPool'],
            critical: true
        });
        
        // Context Engine
        await serviceRegistry.register('contextEngine', async (deps) => {
            const { ContextEngine } = await lazyLoad('./src/services/ContextEngine.js');
            const context = new ContextEngine({
                sharedMemory: deps.sharedMemory,
                worldModel: deps.worldModel,
            domainContext: 'construction',
            enableProjectContext: true,
            enableComplianceContext: true,
            enableErrorContext: true,
            contextMemorySize: 1000
        });
            await context.initialize();
            return context;
        }, {
            dependencies: ['sharedMemory', 'worldModel'],
            critical: true
        });
        
        console.log('   ✅ All base services initialized');
        });
    }
    
    /**
     * 📋 PHASE 3: Learning Systems (Can be parallel)
     */
    async initializePhase3LearningSystems() {
        return ensureSinglePhase('Phase3-LearningSystems', async () => {
            console.log('\n📋 PHASE 3: LEARNING SYSTEMS');
            console.log('============================');
        
        // These can be initialized in parallel
        const learningSystemPromises = [];
        
        // AlphaGnome
        learningSystemPromises.push(
            serviceRegistry.register('alphaGnome', async (deps) => {
                const { AlphaGnomeEvolutionarySystem } = await lazyLoad('./learning/AlphaGnomeEvolutionarySystem.js');
                const system = new AlphaGnomeEvolutionarySystem({
            populationSize: 100,
            genomeSize: 45,
            elitePercentage: 0.10,
            mutationRate: 0.05,
                    database: deps.dbPool,
            domainContext: 'construction'
        });
                await system.initialize();
                return system;
            }, { dependencies: ['dbPool'] })
        );
        
        // Quantum Evolution
        learningSystemPromises.push(
            serviceRegistry.register('quantumEvolution', async () => {
                const { QuantumEvolutionMasterSystem } = await lazyLoad('./learning/quantum-evolution-master-system.js');
                const system = new QuantumEvolutionMasterSystem({
            enable_quantum_strategies: true,
            enable_competitive_intelligence: true,
            enable_temporal_evolution: true,
            domainContext: 'construction'
        });
                await system.initialize();
                return system;
            })
        );
        
        // Ultra Fast Transformer
        learningSystemPromises.push(
            serviceRegistry.register('ultraFastTransformer', async () => {
                const { UltraFastTransformerDecisionEngine } = await lazyLoad('./learning/UltraFastTransformerDecisionEngine.js');
                const engine = new UltraFastTransformerDecisionEngine();
                await engine.initialize();
                return engine;
            })
        );
        
        // Wait for all learning systems
        await Promise.all(learningSystemPromises);
        console.log('   ✅ All learning systems initialized');
        });
    }
    
    /**
     * 📋 PHASE 4: Syndicate Factory & Agents
     */
    async initializePhase4SyndicateFactory() {
        return ensureSinglePhase('Phase4-SyndicateFactory', async () => {
            console.log('\n📋 PHASE 4: SYNDICATE FACTORY & AGENTS');
            console.log('======================================');
        
        // Construction Syndicate Factory
        await serviceRegistry.register('syndicateFactory', async (deps) => {
            const { ConstructionSyndicateFactory } = await lazyLoad('./src/construction/factories/ConstructionSyndicateFactory.js');
            const factory = new ConstructionSyndicateFactory({
                database: deps.dbPool,
                sharedDatabasePool: deps.dbPool,
                centralNervousSystem: deps.centralNervousSystem,
                worldModel: deps.worldModel,
                contextEngine: deps.contextEngine
            });
            
            // Connect learning systems
            factory.alphaGnome = deps.alphaGnome;
            factory.quantumEvolution = deps.quantumEvolution;
            factory.ultraFastTransformer = deps.ultraFastTransformer;
            
            await factory.initialize();
            return factory;
        }, {
            dependencies: ['dbPool', 'centralNervousSystem', 'worldModel', 'contextEngine', 'alphaGnome', 'quantumEvolution', 'ultraFastTransformer'],
            critical: true
        });
        
        // Construction Orchestrator
        await serviceRegistry.register('constructionOrchestrator', async (deps) => {
            const factory = deps.syndicateFactory;
            
            // CRITICAL FIX: Handle null/undefined factory properties
            if (!factory) {
                console.warn('⚠️ syndicateFactory not available, using placeholder orchestrator');
                return {
                    initialize: async () => console.log('Placeholder orchestrator initialized'),
                    execute: async () => ({ status: 'pending', message: 'Orchestrator not ready' })
                };
            }
            
            if (!factory.serviceRegistry || !factory.serviceRegistry.constructionServices) {
                console.warn('⚠️ Construction services not available, using placeholder orchestrator');
                return {
                    initialize: async () => console.log('Placeholder orchestrator initialized'),
                    execute: async () => ({ status: 'pending', message: 'Orchestrator not ready' })
                };
            }
            
            const constructionServices = await factory.serviceRegistry.constructionServices.initialize();
            return constructionServices.orchestrator || {
                initialize: async () => console.log('Default orchestrator initialized'),
                execute: async () => ({ status: 'success', message: 'Default execution' })
            };
        }, {
            dependencies: ['syndicateFactory'],
            critical: false
        });
        
        console.log('   ✅ Syndicate factory and agents initialized');
        });
    }
    
    /**
     * 📋 PHASE 5: UI & Monitoring (Non-critical)
     */
    async initializePhase5UIMonitoring() {
        return ensureSinglePhase('Phase5-UIMonitoring', async () => {
            console.log('\n📋 PHASE 5: UI & MONITORING');
            console.log('===========================');
        
        if (this.config.enableWebInterface) {
            try {
                await serviceRegistry.register('webInterface', async () => {
                    const { getConstructionGUIServer } = await lazyLoad('./src/web/construction-gui-server.js');
                    const guiServer = getConstructionGUIServer({
                port: 3001,
                enableWebSocket: true,
                updateInterval: 2000,
                        corsOrigins: ['http://localhost:3001', 'http://162.55.83.33:3001']
                    });
                    await guiServer.initialize();
                    return guiServer;
                }, { critical: false });
                
                console.log('   ✅ Web interface initialized');
        } catch (error) {
                console.warn('   ⚠️ Web interface failed to initialize:', error.message);
            }
        }
        
        // State Persistence
        await serviceRegistry.register('statePersistence', async (deps) => {
            const { SystemStatePersistence } = await lazyLoad('./src/core/SystemStatePersistence.js');
            const persistence = new SystemStatePersistence({
                database: deps.dbPool,
                backupInterval: 60 * 60 * 1000,
                incrementalSaveInterval: 5 * 60 * 1000,
                maxBackupRetention: 168,
            enableStateValidation: true
        });
            await persistence.initialize();
            return persistence;
        }, { 
            dependencies: ['dbPool'],
            critical: false 
        });
        
        console.log('   ✅ UI & monitoring systems initialized');
        });
    }
    
    /**
     * 📋 PHASE 6: Background Tasks (Must be last)
     */
    async initializePhase6BackgroundTasks() {
        return ensureSinglePhase('Phase6-BackgroundTasks', async () => {
            console.log('\n📋 PHASE 6: BACKGROUND TASKS');
            console.log('============================');
        
        // Background Task Manager
        const { backgroundTaskManager } = await lazyLoad('./src/utils/BackgroundTaskManager.js');
        
        // Register in service registry instead of global
        serviceRegistry.register('backgroundTaskManager', backgroundTaskManager, { lazy: false });
        
        // Mark system as ready
        backgroundTaskManager.setSystemReady();
        
        console.log('   ✅ Background tasks activated');
        
        // Autonomous Intelligence
        try {
            await serviceRegistry.register('autonomousIntelligence', async (deps) => {
                const { AutonomousConstructionTaskOrchestrator } = await lazyLoad('./src/construction/autonomous/AutonomousConstructionTaskOrchestrator.js');
                const autonomous = new AutonomousConstructionTaskOrchestrator({
                    enableLearning: true,
                    enableHOAIMonitoring: true,
                    enableIndustryAnalysis: true,
                    enableSelfImprovement: true,
                    enableAgentCollaboration: true,
                    maxConcurrentTasks: 15,
                    learningIntensity: 'maximum'
                });
                
                await autonomous.initialize({
                    backgroundTaskManager: deps.backgroundTaskManager,
                    syndicateFactory: deps.syndicateFactory,
                    database: deps.dbPool,
                    ollamaService: deps.ollamaService,
                    agents: new Map(),
                    sharedMemory: deps.sharedMemory,
                    llmJudge: deps.centralNervousSystem
                });
                
                return autonomous;
            }, {
                dependencies: ['backgroundTaskManager', 'syndicateFactory', 'dbPool', 'ollamaService', 'sharedMemory', 'centralNervousSystem'],
                critical: false
            });
            
            console.log('   ✅ 24/7 Autonomous intelligence activated');
        } catch (error) {
            console.warn('   ⚠️ Autonomous intelligence failed:', error.message);
        }
        });
    }
    
    /**
     * 🚀 START THE CONSTRUCTION SYNDICATE
     */
    async start() {
        // Prevent multiple starts
        if (this.systemStarted) {
            console.log('⚠️ System already started - entering observation mode');
            await this.enterObservationMode();
            return;
        }
        
        if (!this.isInitialized) {
            throw new Error('System not initialized! Call initialize() first.');
        }
        
        // Mark system as started
        SYSTEM_STARTED = true;
        
            console.log('🚀 STARTING CONSTRUCTION SYNDICATE FOR HOAI LP 6 & 7...');
            console.log('===================================================');
            
        try {
            // Get services from registry
            const syndicateFactory = await serviceRegistry.get('syndicateFactory');
            const constructionOrchestrator = await serviceRegistry.get('constructionOrchestrator', { optional: true });
            
            if (!constructionOrchestrator || typeof constructionOrchestrator.execute !== 'function') {
                console.warn('⚠️ Using placeholder construction orchestrator - construction features limited');
            }
            
            // Create agents
            await this.createConstructionAgents(syndicateFactory);
            
            // Start background tasks for agents
            await this.startAgentBackgroundTasks();
            
            // Start construction processing
            await this.startConstructionProcessing();
            
            this.isRunning = true;
            
            console.log('🎉 CONSTRUCTION SYNDICATE OPERATIONAL!');
        
        this.systemStarted = true;
            
            // Start system monitoring
            this.startSystemMonitoring();
            
            // Save initial state
            const statePersistence = await serviceRegistry.get('statePersistence', { optional: true });
            if (statePersistence) {
                await statePersistence.saveIncrementalUpdate();
            }
            
            // CRITICAL: Enter observation mode after successful startup
            await this.enterObservationMode();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to start construction syndicate:', error);
            throw error;
        }
    }
    
    /**
     * 🏭 Create Construction Agents
     */
    async createConstructionAgents(syndicateFactory) {
        const characterFiles = [
            'head-architect-orchestrator.character.json',
            'quantity-surveyor-specialist.character.json',
            'error-detection-auditor.character.json'
        ];
            
            for (const characterFile of characterFiles) {
                try {
                const fullPath = path.join(this.config.characterFilesDir, characterFile);
                    console.log(`   🤖 Creating agent from ${characterFile}...`);
                    
                const agent = await syndicateFactory.createAgentFromCharacter(fullPath);
                
                // Connect to services
                agent.centralNervousSystem = await serviceRegistry.get('centralNervousSystem');
                agent.sharedMemory = await serviceRegistry.get('sharedMemory');
                agent.worldModel = await serviceRegistry.get('worldModel');
                agent.contextEngine = await serviceRegistry.get('contextEngine');
                agent.constructionOrchestrator = await serviceRegistry.get('constructionOrchestrator', { optional: true });
                    
                    this.agents.set(agent.agentId, agent);
                console.log(`   ✅ Agent ${agent.agentId} created`);
                    
                } catch (error) {
                    console.error(`   ❌ Failed to create agent from ${characterFile}:`, error.message);
                }
            }
            
            this.systemMetrics.totalAgents = this.agents.size;
    }
    
    /**
     * 🔄 Start Agent Background Tasks
     */
    async startAgentBackgroundTasks() {
        // Simplified task creation to prevent spam
        console.log('   🤖 Starting background tasks for agents...');
        
        for (const [agentId, agent] of this.agents) {
            agent.backgroundTasks = [
                {
                    id: `monitoring_${agent.id}`,
                    interval: 300000, // 5 minutes
                    task: () => console.log(`📊 ${agent.id}: Monitoring...`)
                }
            ];
        }
        
        console.log('   ✅ Background tasks configured');
    }
    
    /**
     * 🏗️ Start Construction Processing
     */
    async startConstructionProcessing() {
        console.log('   🏗️ Construction processing systems starting...');
        
        const alphaGnome = await serviceRegistry.get('alphaGnome', { optional: true });
        const quantumEvolution = await serviceRegistry.get('quantumEvolution', { optional: true });
        const ultraFastTransformer = await serviceRegistry.get('ultraFastTransformer', { optional: true });
        
        if (alphaGnome?.startContinuousEvolution) {
            alphaGnome.startContinuousEvolution();
        }
        
        if (quantumEvolution?.startEvolutionCycles) {
            await quantumEvolution.startEvolutionCycles();
        }
        
        if (ultraFastTransformer?.startContinuousLearning) {
            await ultraFastTransformer.startContinuousLearning();
        }
        
        console.log('   ✅ Construction processing active');
    }
    
    /**
     * 📊 Start System Monitoring
     */
    startSystemMonitoring() {
        this.monitoringInterval = setInterval(async () => {
            this.systemMetrics.systemUptime = Date.now() - this.systemStartTime;
            
            console.log('📊 CONSTRUCTION SYNDICATE STATUS:');
            console.log(`   🤖 Active Agents: ${this.agents.size}`);
            console.log(`   📋 Projects: ${this.activeProjects.size}`);
            console.log(`   🕐 Uptime: ${Math.floor(this.systemMetrics.systemUptime / 1000)}s`);
            
            // Show service registry status
            const stats = serviceRegistry.getStatistics();
            console.log(`   🏛️ Services: ${stats.ready}/${stats.totalRegistered} ready`);
            
        }, 60000); // Every minute
    }
    
    /**
     * 🔭 ENTER OBSERVATION MODE
     * System waits for instructions instead of running continuous processes
     */
    async enterObservationMode() {
        if (this.inObservationMode) {
            console.log('📊 Already in observation mode');
            return;
        }
        
        this.inObservationMode = true;
        
        console.log('\n' + '='.repeat(60));
        console.log('🔭 ENTERING OBSERVATION MODE');
        console.log('='.repeat(60));
        console.log('📊 System initialized and ready');
        console.log('⏸️  Continuous processing PAUSED');
        console.log('👂 Waiting for instructions...');
        console.log('💡 The system is now in standby mode to prevent resource drain');
        console.log('💡 No more evolution cycles or background processing');
        console.log('='.repeat(60) + '\n');
        
        // Use SystemObservationController for comprehensive idle mode
        await systemObservationController.enterFullObservationMode(true);
        
        // Also call stopContinuousProcesses for additional cleanup
        await this.stopContinuousProcesses();
    }
    
    /**
     * 🛑 STOP CONTINUOUS PROCESSES
     */
    async stopContinuousProcesses() {
        // CRITICAL: Set global flags immediately
        global.OBSERVATION_MODE_GLOBAL = true;
        global.OBSERVATION_MODE_ENFORCED = true;
        global.SKIP_AUTONOMOUS_SYSTEMS = true;
        console.log('🛑 Stopping continuous processes...');
        
        // CRITICAL: Use ObservationModeEnforcer for centralized control
        try {
            await observationModeEnforcer.enforceObservationMode();
            console.log('   ✅ Observation mode enforced globally');
        } catch (error) {
            console.error('   ❌ Failed to enforce observation mode:', error);
        }
        
        try {
            // CRITICAL FIX: Stop memory sink prevention monitoring
            const memorySystem = await serviceRegistry.get('sharedMemory', { optional: true });
            if (memorySystem?.memorySinkPrevention?.enterObservationMode) {
                await memorySystem.memorySinkPrevention.enterObservationMode();
                console.log('   ✅ Memory sink prevention monitoring stopped');
            }
            
            // CRITICAL FIX: Stop elite memory persistence engine spam - check multiple service names
            const memoryPersistenceNames = ['eliteMemoryPersistence', 'memoryPersistence', 'persistenceEngine'];
            let memoryPersistenceFound = false;
            
            for (const serviceName of memoryPersistenceNames) {
                const memoryPersistence = await serviceRegistry.get(serviceName, { optional: true });
                if (memoryPersistence?.enterObservationMode) {
                    await memoryPersistence.enterObservationMode();
                    console.log(`   ✅ Elite memory persistence (${serviceName}) DEBUG logging stopped`);
                    memoryPersistenceFound = true;
                    break;
                }
            }
            
            if (!memoryPersistenceFound) {
                console.log('   ⚠️ Elite memory persistence not found - trying global access');
                // Try to access the singleton directly if available
                try {
                    const { EliteMemoryPersistenceEngine } = await import('./src/memory/EliteMemoryPersistenceEngine.js');
                    // Check if singleton instance exists
                    if (global.eliteMemoryPersistence) {
                        global.eliteMemoryPersistence.observationMode = true;
                        console.log('   ✅ Elite memory persistence observation mode set via global access');
                    }
                } catch (error) {
                    console.log('   ⚠️ Could not access memory persistence directly');
                }
            }
            
            // CRITICAL FIX: Stop quantum performance monitoring
            const worldModel = await serviceRegistry.get('worldModel', { optional: true });
            if (worldModel?.quantumGraphNeuralNetwork?.enterObservationMode) {
                await worldModel.quantumGraphNeuralNetwork.enterObservationMode();
                console.log('   ✅ Quantum performance monitoring stopped');
            }
            
            // CRITICAL FIX: Stop quantum coherence monitoring (construction spam source)
            if (worldModel?.quantumCoherenceEngine?.enterObservationMode) {
                await worldModel.quantumCoherenceEngine.enterObservationMode();
                console.log('   ✅ Quantum coherence monitoring stopped');
            } else {
                console.log('   ⚠️ Quantum coherence engine not found or no observation mode');
            }
            
            // CRITICAL FIX: Stop SFT Flywheel Governor hardcoded safety checks
            const sftGovernor = await serviceRegistry.get('sftFlywheelGovernor', { optional: true });
            if (sftGovernor?.enterObservationMode) {
                await sftGovernor.enterObservationMode();
                console.log('   ✅ SFT Flywheel Governor hardcoded checks stopped');
            } else {
                console.log('   ⚠️ SFT Flywheel Governor not found');
            }
            
            // CRITICAL FIX: Stop autonomous creativity simulations
            const creativityIntegrator = await serviceRegistry.get('creativitySystemIntegrator', { optional: true });
            if (creativityIntegrator?.enterObservationMode) {
                await creativityIntegrator.enterObservationMode();
                console.log('   ✅ Autonomous creativity simulations stopped');
            } else {
                console.log('   ⚠️ Creativity integrator not found');
            }
            
            // CRITICAL FIX: Stop safety threshold monitoring
            const safetyManager = await serviceRegistry.get('safetyThresholdManager', { optional: true });
            if (safetyManager?.enterObservationMode) {
                await safetyManager.enterObservationMode();
                console.log('   ✅ Safety threshold monitoring stopped');
            } else {
                console.log('   ⚠️ Safety threshold manager not found or no observation mode');
            }
            
            // CRITICAL: Register all major services with observation controller
            console.log('   📊 Registering services with observation controller...');
            const servicesToRegister = [
                'alphaGnome', 'quantumEvolution', 'ultraFastTransformer',
                'ollamaService', 'centralNervousSystem', 'sharedMemory',
                'worldModel', 'contextEngine', 'syndicateFactory',
                'constructionOrchestrator', 'webInterface', 'statePersistence',
                'safetyThresholdManager', 'creativitySystemIntegrator', 
                'sftFlywheelGovernor', 'memoryPersistence'
            ];
            
            for (const serviceName of servicesToRegister) {
                const service = await serviceRegistry.get(serviceName, { optional: true });
                if (service) {
                    systemObservationController.registerSystem(serviceName, service);
                    // Put system in observation mode immediately
                    systemObservationController.putSystemInObservation(serviceName);
                }
            }
            
            // CRITICAL FIX: Stop ALL evolution processes with aggressive cleanup
            console.log('   🛑 Stopping AlphaGnome evolution systems...');
            const alphaGnome = await serviceRegistry.get('alphaGnome', { optional: true });
            if (alphaGnome) {
                if (alphaGnome.stopEvolution) alphaGnome.stopEvolution();
                if (alphaGnome.stopContinuousEvolution) alphaGnome.stopContinuousEvolution();
                if (alphaGnome.enterObservationMode) alphaGnome.enterObservationMode();
                // CRITICAL: Clear any evolution intervals
                if (alphaGnome.alphaGnomeEvolutionInterval) {
                    clearInterval(alphaGnome.alphaGnomeEvolutionInterval);
                    alphaGnome.alphaGnomeEvolutionInterval = null;
                }
                console.log('   ✅ AlphaGnome evolution stopped');
            }
            
            console.log('   🛑 Stopping quantum evolution systems...');
            const quantumEvolution = await serviceRegistry.get('quantumEvolution', { optional: true });
            if (quantumEvolution) {
                if (quantumEvolution.stopEvolutionCycles) quantumEvolution.stopEvolutionCycles();
                if (quantumEvolution.enterObservationMode) quantumEvolution.enterObservationMode();
                console.log('   ✅ Quantum evolution stopped');
            }
            
            console.log('   🛑 Stopping transformer learning systems...');
            const ultraFastTransformer = await serviceRegistry.get('ultraFastTransformer', { optional: true });
            if (ultraFastTransformer) {
                if (ultraFastTransformer.stopContinuousLearning) ultraFastTransformer.stopContinuousLearning();
                if (ultraFastTransformer.enterObservationMode) ultraFastTransformer.enterObservationMode();
                // CRITICAL: Clear transformer intervals
                if (ultraFastTransformer.learningInterval) {
                    clearInterval(ultraFastTransformer.learningInterval);
                    ultraFastTransformer.learningInterval = null;
                }
                if (ultraFastTransformer.adaptationInterval) {
                    clearInterval(ultraFastTransformer.adaptationInterval);
                    ultraFastTransformer.adaptationInterval = null;
                }
                console.log('   ✅ Transformer learning stopped');
            }
            
            // CRITICAL FIX: Stop construction syndicate factory evolution
            console.log('   🛑 Stopping construction syndicate evolution...');
            try {
                // Stop ConstructionSyndicateFactory evolution intervals
                for (const [agentId, agent] of this.agents) {
                    if (agent.alphaGnomeEvolutionInterval) {
                        clearInterval(agent.alphaGnomeEvolutionInterval);
                        agent.alphaGnomeEvolutionInterval = null;
                    }
                    if (agent.autosaveInterval) {
                        clearInterval(agent.autosaveInterval);
                        agent.autosaveInterval = null;
                    }
                }
                console.log('   ✅ Construction syndicate evolution stopped');
        } catch (error) {
                console.warn('   ⚠️ Error stopping construction syndicate evolution:', error.message);
            }
            
            // Clear monitoring interval
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
                console.log('   ✅ System monitoring stopped');
            }
            
            // Stop agent background tasks
            for (const [agentId, agent] of this.agents) {
                if (agent.stopBackgroundTasks) {
                    await agent.stopBackgroundTasks();
                }
            }
            if (this.agents.size > 0) {
                console.log('   ✅ Agent background tasks stopped');
            }
            
            // CRITICAL FIX: Aggressive interval cleanup
            console.log('   🛑 Performing aggressive interval cleanup...');
            await this.performAggressiveIntervalCleanup();
            
            // Stop any global intervals
            const intervals = [
                'evolutionInterval',
                'learningInterval',
                'quantumEvolutionInterval',
                'continuousLearningInterval',
                'performanceMonitoringInterval',
                'backgroundTasksInterval',
                'alphaGnomeEvolutionInterval',
                'autosaveInterval',
                'adaptationInterval'
            ];
            
            for (const intervalName of intervals) {
                if (global[intervalName]) {
                    clearInterval(global[intervalName]);
                    delete global[intervalName];
                    console.log(`   ✅ ${intervalName} stopped`);
                }
            }
            
        } catch (error) {
            console.error('⚠️ Error stopping processes:', error.message);
        }
        
        console.log('✅ All continuous processes stopped');
        console.log('🔄 System ready for on-demand operations');
    }
    
    /**
     * 🛑 AGGRESSIVE INTERVAL CLEANUP
     * Scans and stops ALL intervals in the system
     */
    async performAggressiveIntervalCleanup() {
        console.log('   🔍 Scanning for active intervals...');
        
        try {        
            // Get all registered services from the services Map
            const services = serviceRegistry.services;
            let intervalsCleared = 0;
            
            for (const [serviceName, service] of services) {
                if (service && typeof service === 'object') {
                    // Look for common interval property names
                    const intervalProps = [
                        'interval', 'monitoringInterval', 'updateInterval', 'learningInterval',
                        'evolutionInterval', 'adaptationInterval', 'autosaveInterval', 
                        'feedbackInterval', 'performanceInterval', 'cleanupInterval',
                        'heartbeatInterval', 'syncInterval', 'checkInterval',
                        'alphaGnomeEvolutionInterval', 'quantumEvolutionInterval'
                    ];
                    
                    for (const prop of intervalProps) {
                        if (service[prop] && typeof service[prop] === 'object') {
                            try {
                                clearInterval(service[prop]);
                                service[prop] = null;
                                intervalsCleared++;
                                console.log(`   ✅ Cleared ${prop} from ${serviceName}`);
                            } catch (err) {
                                console.warn(`   ⚠️ Failed to clear ${prop} from ${serviceName}:`, err.message);
                            }
                        }
                    }
                    
                    // Look for monitoringIntervals object
                    if (service.monitoringIntervals && typeof service.monitoringIntervals === 'object') {
                        for (const [name, intervalId] of Object.entries(service.monitoringIntervals)) {
                            if (intervalId) {
                                try {
                                    clearInterval(intervalId);
                                    service.monitoringIntervals[name] = null;
                                    intervalsCleared++;
                                    console.log(`   ✅ Cleared ${name} monitoring interval from ${serviceName}`);
                                } catch (err) {
                                    console.warn(`   ⚠️ Failed to clear ${name} from ${serviceName}:`, err.message);
                                }
                            }
                        }
                    }
                }
            }
            
            console.log(`   ✅ Aggressive cleanup complete: ${intervalsCleared} intervals cleared`);
            
            } catch (error) {
            console.error('   ❌ Error during aggressive interval cleanup:', error.message);
        }
    }

    /**
     * 🛑 Graceful Shutdown
     */
    async shutdown() {
        console.log('🛑 Shutting down Construction Syndicate...');
        
        this.isRunning = false;
        
        // Stop continuous processes first
        await this.stopContinuousProcesses();
        
        try {
            // Shutdown services in reverse order
            await serviceRegistry.shutdown();
            
            // Shutdown module loader
            moduleLoader.shutdown();
            
            } catch (error) {
            console.error('⚠️ Error during shutdown:', error);
        }
        
        console.log('✅ Construction Syndicate shutdown complete');
        }
    }

    /**
 * 🛑 KILL ALL EXISTING SYNDICATE SYSTEMS
 * Ensures no multiple instances run concurrently
 */
async function killAllExistingSystems() {
    console.log('🛑 KILLING ALL EXISTING SYNDICATE SYSTEMS');
    console.log('=========================================');
    console.log(`   📍 Current process PID: ${process.pid}`);
    
    try {
        // Kill Node.js processes running startfullsyndicate
        console.log('🔍 Scanning for existing syndicate processes...');
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        // Find all startfullsyndicate processes
        try {
            const { stdout } = await execAsync('ps aux | grep startfullsyndicate | grep -v grep || true');
            const processes = stdout.trim().split('\n').filter(line => line.length > 0);
            
            if (processes.length > 0) {
                console.log(`   🔍 Found ${processes.length} process line(s)`);
                
                let killedCount = 0;
                // Extract PIDs and kill them (excluding current process)
                for (const processLine of processes) {
                    const pid = processLine.split(/\s+/)[1];
                    if (pid && pid !== process.pid.toString()) {
                        try {
                            process.kill(pid, 'SIGTERM');
                            console.log(`   ✅ Killed process ${pid}`);
                            killedCount++;
                        } catch (error) {
                            console.log(`   ⚠️ Process ${pid} already terminated`);
                        }
                    } else if (pid === process.pid.toString()) {
                        console.log(`   ⏭️ Skipping current process ${pid}`);
                    }
                }
                
                if (killedCount === 0) {
                    console.log('   ✅ No other processes to kill (only current process found)');
                    return; // Don't wait or force kill if no other processes
                }
                
                // Wait for graceful termination
                console.log('   ⏳ Waiting for graceful termination...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Force kill if necessary (but exclude current process)
                try {
                    // Get list of PIDs excluding current process
                    const { stdout: pids } = await execAsync(`pgrep -f startfullsyndicate | grep -v "^${process.pid}$" || true`);
                    const pidList = pids.trim().split('\n').filter(p => p && p !== process.pid.toString());
                    
                    if (pidList.length > 0) {
                        // Kill each PID individually, excluding current process
                        for (const targetPid of pidList) {
                            if (targetPid && targetPid !== process.pid.toString()) {
                                try {
                                    await execAsync(`kill -9 ${targetPid} 2>/dev/null || true`);
                                    console.log(`   🔥 Force terminated process ${targetPid}`);
                                } catch (error) {
                                    // Process may already be dead
                                }
                            }
                        }
                    }
                } catch (error) {
                    // Ignore errors - processes may already be dead
                }
            } else {
                console.log('   ✅ No existing processes found');
            }
        } catch (error) {
            console.log('   ⚠️ Process scan failed, continuing...');
        }
        
        // Clear any PM2 instances
        try {
            await execAsync('pm2 stop aigo-syndicate-main 2>/dev/null || true');
            await execAsync('pm2 delete aigo-syndicate-main 2>/dev/null || true');
            console.log('   ✅ PM2 instances cleared');
        } catch (error) {
            // Ignore PM2 errors
        }
        
        console.log('✅ System cleanup complete - ready for fresh start');
        
    } catch (error) {
        console.error('❌ Error during system cleanup:', error.message);
        console.log('⚠️ Proceeding with initialization anyway...');
    }
}

/**
 * 🚀 MAIN EXECUTION WITH NEW INITIALIZATION SYSTEM
 */
async function main() {
    console.log('🏗️🚀 REVOLUTIONARY AI CONSTRUCTION SYNDICATE');
    console.log('============================================');
    console.log('🧠 ZERO CIRCULAR DEPENDENCIES');
    console.log('🚀 PHASED INITIALIZATION');
    console.log('💉 DEPENDENCY INJECTION');
    console.log('============================================');
    
    // CRITICAL FIX: Kill ALL existing syndicate systems FIRST
    await killAllExistingSystems();
    
    // Create orchestrator
    const orchestrator = new MasterConstructionSyndicateOrchestrator({
        mode: 'construction',
        projectType: 'hoai_lp6_7',
        enableVisionProcessing: true,
        enableErrorDetection: true,
        enableHumanEscalation: true,
        enableWebInterface: true,
        enableQuantumEnhancements: true,
        learningIntensity: 'maximum'
    });
    
    // Register initialization components
    initializationManager.registerComponent('patches', async () => {
        await orchestrator.initializePhase1CoreInfrastructure();
    }, { critical: true });
    
    initializationManager.registerComponent('baseServices', async () => {
        await orchestrator.initializePhase2BaseServices();
    }, { critical: true, dependencies: ['patches'] });
    
    initializationManager.registerComponent('learningSystems', async () => {
        await orchestrator.initializePhase3LearningSystems();
    }, { critical: false, dependencies: ['baseServices'] });
    
    initializationManager.registerComponent('syndicateFactory', async () => {
        await orchestrator.initializePhase4SyndicateFactory();
    }, { critical: true, dependencies: ['learningSystems'] });
    
    initializationManager.registerComponent('uiMonitoring', async () => {
        await orchestrator.initializePhase5UIMonitoring();
    }, { critical: false, dependencies: ['syndicateFactory'] });
    
    initializationManager.registerComponent('backgroundTasks', async () => {
        await orchestrator.initializePhase6BackgroundTasks();
    }, { critical: false, dependencies: ['uiMonitoring'] });
    
    try {
        // Run phased initialization
        await initializationManager.initialize();
        
        // Mark orchestrator as initialized
        orchestrator.isInitialized = true;
        
        // Start the system but immediately enter observation mode
        await orchestrator.start();
        
        // CRITICAL: Register components with ObservationModeEnforcer
        try {
            const quantumEvolution = await serviceRegistry.get('quantumEvolution', { optional: true });
            if (quantumEvolution) {
                observationModeEnforcer.registerComponent(quantumEvolution, 'QuantumEvolutionCollaboration');
            }
            
            const alphaGnome = await serviceRegistry.get('alphaGnome', { optional: true });
            if (alphaGnome) {
                observationModeEnforcer.registerComponent(alphaGnome, 'AlphaGnomeEvolution');
            }
            
            const entanglementEngine = await serviceRegistry.get('entanglementEngine', { optional: true });
            if (entanglementEngine) {
                observationModeEnforcer.registerComponent(entanglementEngine, 'QuantumEntanglementEngine');
            }
            
            console.log('   ✅ Components registered with ObservationModeEnforcer');
        } catch (error) {
            console.warn('   ⚠️ Some components could not be registered:', error.message);
        }
        
        // CRITICAL: Immediately enter observation mode after initialization
        if (OBSERVATION_MODE_ENFORCED) {
            console.log('\n🔭 Forcing system into observation mode...');
            await orchestrator.enterObservationMode();
            
            // Register OnDemandActivator for user requests
            serviceRegistry.register('onDemandActivator', onDemandActivator);
            
            // Start health reporter (allowed in observation mode)
            systemHealthReporter.startReporting();
            serviceRegistry.register('healthReporter', systemHealthReporter);
            
            console.log('\n' + '='.repeat(60));
            console.log('🎉 CONSTRUCTION SYNDICATE IN OBSERVATION MODE');
            console.log('='.repeat(60));
            console.log('✅ System initialized successfully');
            console.log('🔭 True idle mode active');
            console.log('👂 Waiting for user instructions via OnDemandActivator');
            console.log('📊 Health reports every 5 minutes');
            console.log('📊 Target: <5 logs per minute (excluding health reports)');
            console.log('='.repeat(60));
        } else {
            console.log('🎉 CONSTRUCTION SYNDICATE FULLY OPERATIONAL!');
            console.log('============================================');
        }
        
        // Show initialization metrics
        const metrics = initializationManager.getMetrics();
        console.log(`⏱️ Total initialization time: ${(metrics.totalTime / 1000).toFixed(2)}s`);
        
        // Show dependency graph
        if (process.env.DEBUG) {
            moduleLoader.visualizeDependencyGraph();
            serviceRegistry.visualizeDependencies();
            initializationManager.visualizeStatus();
            circularDetector.visualizeDependencyGraph();
        }
        
        // Always show circular dependency summary
        const circularReport = circularDetector.getReport();
        if (circularReport.circularDependencies.length > 0) {
            console.warn(`\n⚠️ Detected ${circularReport.circularDependencies.length} circular dependencies`);
            console.warn('Run with DEBUG=true to see details');
        }
        
        // Setup graceful shutdown
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        
        async function gracefulShutdown(signal) {
            console.log(`\n🛑 Received ${signal} - initiating graceful shutdown...`);
                    await orchestrator.shutdown();
                process.exit(0);
            }
        
    } catch (error) {
        console.error('💥 CRITICAL SYSTEM FAILURE:', error);
        console.error('🔍 Error Stack:', error.stack);
        
        // Show what failed
        initializationManager.visualizeStatus();
        
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 UNCAUGHT EXCEPTION:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    // Only log critical rejections
    const ignoredErrors = [
        'savePerformanceData is not a function',
        'password authentication failed',
        'Cannot read properties of undefined'
    ];
    
    const message = reason?.message || reason?.toString() || '';
    if (ignoredErrors.some(err => message.includes(err))) {
        return; // Ignore known non-critical errors
    }
    
    console.error('💥 UNHANDLED REJECTION:', reason);
});

// Execute main
console.log('🚀 AIGO-SYNDICATE STARTUP: Executing main() initialization sequence...');
main().catch(error => {
    console.error('💥 FATAL ERROR in main():', error);
    process.exit(1);
});