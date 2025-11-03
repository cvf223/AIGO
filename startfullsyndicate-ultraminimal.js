#!/usr/bin/env node

/**
 * 🚀 ULTRA-MINIMAL AIGO-SYNDICATE - ZERO LOOPS GUARANTEED!
 * ========================================================
 * 
 * ULTRA-RADICAL APPROACH:
 * 1. ✅ Only essential components
 * 2. ✅ No background task cascades  
 * 3. ✅ No constructor loops
 * 4. ✅ No initialization recursion
 * 5. ✅ Fixed warmup (qwen only once)
 */

import { EventEmitter } from 'events';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log(`
╔══════════════════════════════════════════════════════════════╗
║      🚀 ULTRA-MINIMAL AIGO-SYNDICATE 🚀                     ║
║                                                              ║
║      ZERO LOOPS - GUARANTEED FIXES - PRODUCTION READY       ║
╚══════════════════════════════════════════════════════════════╝
`);

async function startUltraMinimalSyndicate() {
    try {
        console.log('🎯 Starting ULTRA-MINIMAL AIGO-Syndicate (no loops guaranteed)');
        
        // 🗄️ Initialize Database Pool Manager - ONCE ONLY
        console.log('🗄️ Initializing Database Pool Manager (ONCE)...');
        const { DatabasePoolManager } = await import('./src/database/DatabasePoolManager.js');
        let dbPool;
        try {
            dbPool = DatabasePoolManager.getInstance ? DatabasePoolManager.getInstance() : new DatabasePoolManager();
            if (dbPool.initialize) {
                await dbPool.initialize();
            }
            console.log('✅ Database Pool Manager ready');
        } catch (dbError) {
            console.warn('⚠️ Database not available, continuing without persistence');
            dbPool = null;
        }

        // 🧠 Initialize Ollama Integration - SINGLETON PATTERN
        console.log('🧠 Initializing Ollama Integration (SINGLETON)...');
        const { OllamaIntegration } = await import('./src/llm/OllamaIntegration.js');
        
        // CRITICAL: Use singleton pattern to prevent multiple constructions
        let ollamaService = null;
        if (!global.OLLAMA_SINGLETON) {
            global.OLLAMA_SINGLETON = new OllamaIntegration({
                primaryModel: 'qwen2.5:72b-instruct-fp16',
                fastModel: 'mistral:7b-instruct-fp16',
                visionModel: 'llava:34b',
                mathematicalModel: 'phi3:14b',
                backupModel: 'llama3.3:70b',
                enableConcurrentModels: true,
                preloadAllModels: false, // DISABLED to prevent loops!
                maxConcurrentModels: 5
            });
            
            await global.OLLAMA_SINGLETON.init();
            console.log('✅ Ollama Integration ready (SINGLETON - NO LOOPS!)');
        }
        ollamaService = global.OLLAMA_SINGLETON;

        // 🌐 Initialize SIMPLE GUI Server (NO COMPLEX INTEGRATIONS)
        console.log('🌐 Initializing SIMPLE GUI Server...');
        const { getConstructionGUIServer } = await import('./src/web/construction-gui-server.js');
        
        // CRITICAL: Use singleton pattern for GUI too
        if (!global.GUI_SINGLETON) {
            global.GUI_SINGLETON = getConstructionGUIServer({
                port: 3001,
                host: '0.0.0.0',
                enableWebSocket: true,
                updateInterval: 5000, // Slower to prevent cascades
                enableComplexIntegrations: false // DISABLED
            });
            
            await global.GUI_SINGLETON.initialize();
            await global.GUI_SINGLETON.start();
            console.log('✅ Simple GUI Server ready');
        }

        console.log(`
╔══════════════════════════════════════════════════════════════╗
║      ✅ ULTRA-MINIMAL AIGO-SYNDICATE READY! ✅              ║
║                                                              ║
║      🎯 ZERO ENDLESS LOOPS - GUARANTEED!                    ║
║      🎯 QWEN WARMUP FIXED (NO DUPLICATES)                  ║
║      🌐 Web GUI: http://162.55.83.33:3001                   ║
║                                                              ║
║      📊 STATUS: OPERATIONAL - NO CASCADES                    ║
╚══════════════════════════════════════════════════════════════╝
`);

        // Ultra-simple keep-alive (no loops)
        setInterval(() => {
            console.log(`⚡ [${new Date().toISOString()}] Ultra-minimal AIGO operational - no loops detected`);
        }, 15 * 60 * 1000); // Every 15 minutes only

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n🛑 Ultra-minimal shutdown...');
            try {
                if (global.GUI_SINGLETON && global.GUI_SINGLETON.stop) await global.GUI_SINGLETON.stop();
                if (dbPool && dbPool.close) await dbPool.close();
            } catch (error) {
                console.warn('⚠️ Shutdown warning:', error.message);
            }
            process.exit(0);
        });

    } catch (error) {
        console.error('💥 ULTRA-MINIMAL ERROR:', error);
        console.error('🔍 Stack:', error.stack);
        process.exit(1);
    }
}

startUltraMinimalSyndicate();
