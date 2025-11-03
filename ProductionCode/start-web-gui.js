#!/usr/bin/env node
/**
 * 🌐 WEB GUI STARTUP SCRIPT
 * ========================
 * Clean startup script for Construction GUI Server
 */

import { ConstructionGUIServer } from './src/web/construction-gui-server.js';

async function startWeb() {
    try {
        console.log('🌐 Starting Construction GUI Server...');
        
        // Create server instance
        const server = new ConstructionGUIServer();
        console.log('🏗️ Construction GUI Server instance created');
        
        // Initialize server (creates httpServer and all components)
        await server.initialize();
        console.log('✅ Server initialized successfully');
        
        // Start the server
        await server.start();
        console.log('🚀 Web GUI is now running!');
        
        // Keep the process alive
        process.on('SIGINT', async () => {
            console.log('\n📛 Shutting down gracefully...');
            await server.shutdown();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            console.log('\n📛 Shutting down gracefully...');
            await server.shutdown();
            process.exit(0);
        });
        
        return server;
        
    } catch (error) {
        console.error('❌ Web server failed:', error);
        throw error;
    }
}

// Auto-start if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startWeb().catch((error) => {
        console.error('❌ Failed to start web GUI:', error);
        process.exit(1);
    });
}

export { startWeb };
