#!/usr/bin/env node

/**
 * 🚀 INTEGRATED AIGO-SYNDICATE WITH ULTIMATE GUI
 * ==============================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION: 
 * - GUI ONLY runs when AIGO-Syndicate is running
 * - Real-time data connection between orchestrator and GUI
 * - Proper system integration bridge with live data
 * - Ultimate GUI with functional visualizations
 * 
 * This is the PROPER way to run the system!
 */

import { EventEmitter } from 'events';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log(`
╔══════════════════════════════════════════════════════════════╗
║     🚀 INTEGRATED AIGO-SYNDICATE + ULTIMATE GUI 🚀          ║
║                                                              ║
║     Running on 896GB Production Server                      ║
║     GUI integrated with live orchestrator data              ║
╚══════════════════════════════════════════════════════════════╝
`);

class IntegratedAIGOSyndicate extends EventEmitter {
    constructor() {
        super();
        this.orchestrator = null;
        this.isRunning = false;
        
        // Graceful shutdown handling
        process.on('SIGINT', () => this.gracefulShutdown());
        process.on('SIGTERM', () => this.gracefulShutdown());
    }
    
    async start() {
        try {
            console.log('🎯 Starting INTEGRATED AIGO-Syndicate...');
            
            // Force enable web interface in environment
            process.env.ENABLE_WEB_INTERFACE = 'true';
            
            console.log('🏗️ Starting AIGO-Syndicate with FORCED GUI integration...');
            
            // Import and execute the DIRECT approach with real orchestrator classes
            const { startDirectAIGOSyndicateWithGUI } = await import('./startfullsyndicate-with-gui-direct.js');
            
            // Start the system and get reference to REAL orchestrator
            this.orchestrator = await startDirectAIGOSyndicateWithGUI();
            
            this.isRunning = true;
            
            console.log('');
            console.log('✅ INTEGRATED AIGO-SYNDICATE FULLY OPERATIONAL!');
            console.log('');
            console.log('🌟 ACCESS POINTS:');
            console.log('   🌐 Ultimate GUI: http://162.55.83.33:3001');
            console.log('   🔌 WebSocket:    ws://162.55.83.33:3001');
            console.log('   📊 Health:       http://162.55.83.33:3001/health');
            console.log('');
            console.log('🎯 FEATURES ACTIVE:');
            console.log('   ✅ REAL-TIME data from live orchestrator');
            console.log('   ✅ Live agent thoughts and decisions');
            console.log('   ✅ Real quantum system visualization');
            console.log('   ✅ Functional human control center');
            console.log('   ✅ True HOAI compliance monitoring');
            console.log('   ✅ All visualizations with LIVE data');
            console.log('');
            console.log('💡 GUI automatically shuts down when orchestrator stops!');
            console.log('');
            
            // Keep the process running
            this.keepAlive();
            
        } catch (error) {
            console.error('💥 CRITICAL FAILURE: Failed to start integrated system:', error);
            process.exit(1);
        }
    }
    
    keepAlive() {
        // Monitor orchestrator health
        setInterval(async () => {
            if (this.orchestrator && !this.orchestrator.isInitialized) {
                console.log('⚠️  Orchestrator stopped - shutting down GUI...');
                await this.gracefulShutdown();
            }
        }, 5000);
        
        // Keep process alive
        console.log('🔄 System monitoring active - press Ctrl+C to stop');
    }
    
    async gracefulShutdown() {
        if (!this.isRunning) return;
        
        console.log('');
        console.log('🛑 Graceful shutdown initiated...');
        
        try {
            if (this.orchestrator) {
                console.log('   🏗️ Stopping AIGO-Syndicate orchestrator...');
                
                // Stop the GUI server first (it's integrated into orchestrator)
                if (this.orchestrator.constructionGUIServer) {
                    console.log('   💻 Shutting down Ultimate GUI...');
                    await this.orchestrator.constructionGUIServer.stop();
                }
                
                // Stop orchestrator systems
                if (this.orchestrator.stop) {
                    await this.orchestrator.stop();
                }
            }
            
            console.log('✅ Graceful shutdown complete');
            process.exit(0);
            
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    }
}

// Start the integrated system
const integratedSystem = new IntegratedAIGOSyndicate();
integratedSystem.start().catch(error => {
    console.error('💥 Failed to start integrated system:', error);
    process.exit(1);
});

export default IntegratedAIGOSyndicate;
