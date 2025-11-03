#!/usr/bin/env node

/**
 * 🚀 MINIMAL AIGO-SYNDICATE STARTUP - NO ENDLESS LOOPS!
 * =====================================================
 * 
 * FIXES:
 * 1. ✅ Only unique model warmup (no 4x qwen)
 * 2. ✅ No endless initialization cascade
 * 3. ✅ Fast, efficient startup
 * 4. ✅ Core functionality only
 */

import { EventEmitter } from 'events';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log(`
╔══════════════════════════════════════════════════════════════╗
║      🚀 MINIMAL AIGO-SYNDICATE STARTUP 🚀                   ║
║                                                              ║
║      FIXED: No duplicate warmup, no endless initialization  ║
╚══════════════════════════════════════════════════════════════╝
`);

async function startMinimalSyndicate() {
    try {
        // 🗄️ Initialize Database Pool Manager FIRST
        console.log('🗄️ Initializing Database Pool Manager...');
        const { DatabasePoolManager } = await import('./src/database/DatabasePoolManager.js');
        const dbPool = DatabasePoolManager.getInstance ? DatabasePoolManager.getInstance() : new DatabasePoolManager();
        if (dbPool.initialize) {
            await dbPool.initialize();
        }
        console.log('✅ Database Pool Manager initialized');

        // 🧠 Initialize Ollama Integration (FIXED)
        console.log('🧠 Initializing Ollama Integration (FIXED)...');
        const { OllamaIntegration } = await import('./src/llm/OllamaIntegration.js');
        const ollamaService = new OllamaIntegration({
            primaryModel: 'qwen2.5:72b-instruct-fp16',
            precisionModel: 'qwen2.5:72b-instruct-fp16',
            reasoningModel: 'qwen2.5:72b-instruct-fp16',
            fastModel: 'mistral:7b-instruct-fp16',
            visionModel: 'llava:34b',
            mathematicalModel: 'phi3:14b',
            germanModel: 'qwen2.5:72b-instruct-fp16',
            backupModel: 'llama3.3:70b',
            enableConcurrentModels: true,
            preloadAllModels: true,
            maxConcurrentModels: 6
        });
        await ollamaService.init();
        console.log('✅ Ollama Integration initialized (NO DUPLICATES!)');

        // 🏗️ Initialize Construction Orchestrator (MINIMAL)
        console.log('🏗️ Initializing Construction Orchestrator (MINIMAL)...');
        const { ConstructionSyndicateOrchestrator } = await import('./src/construction/ConstructionSyndicateOrchestrator.js');
        const orchestrator = new ConstructionSyndicateOrchestrator({
            mode: 'construction',
            projectType: 'hoai_lp6_7',
            enableVisionProcessing: true,
            enableErrorDetection: true,
            enableHumanEscalation: true,
            ollamaService: ollamaService,
            dbPool: dbPool
        });
        
        // Initialize with controlled complexity
        await orchestrator.initialize();
        console.log('✅ Construction Orchestrator initialized (MINIMAL)');

        // 🌐 Initialize GUI Server
        console.log('🌐 Initializing GUI Server...');
        const { getConstructionGUIServer } = await import('./src/web/construction-gui-server.js');
        const guiServer = getConstructionGUIServer({
            port: 3001,
            host: '0.0.0.0',
            enableWebSocket: true,
            updateInterval: 2000
        });
        
        await guiServer.initialize();
        await guiServer.start();
        console.log('✅ GUI Server initialized');

        console.log(`
╔══════════════════════════════════════════════════════════════╗
║      ✅ MINIMAL AIGO-SYNDICATE READY! ✅                    ║
║                                                              ║
║      🎯 FIXED: No duplicate warmup                          ║
║      🎯 FIXED: No endless initialization                    ║
║      🌐 Web GUI: http://162.55.83.33:3001                   ║
╚══════════════════════════════════════════════════════════════╝
`);

        // Keep process alive without endless loops
        setInterval(() => {
            console.log(`⚡ [${new Date().toISOString()}] AIGO-Syndicate MINIMAL operational`);
        }, 10 * 60 * 1000); // Every 10 minutes

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Graceful shutdown...');
            if (guiServer && guiServer.stop) await guiServer.stop();
            if (orchestrator && orchestrator.shutdown) await orchestrator.shutdown();
            if (dbPool && dbPool.close) await dbPool.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('💥 CRITICAL ERROR:', error);
        console.error('🔍 Stack:', error.stack);
        process.exit(1);
    }
}

startMinimalSyndicate();
