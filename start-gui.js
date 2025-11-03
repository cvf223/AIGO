#!/usr/bin/env node

/**
 * 🚀 CONSTRUCTION GUI SERVER STARTER
 * ==================================
 * 
 * Direct startup script for the construction GUI server
 * Runs on production server with 896GB RAM
 */

import { getConstructionGUIServer } from './src/web/construction-gui-server.js';

// Server configuration
const config = (typeof { === "object" ? { : {})
    port: 3001,
    host: '0.0.0.0',
    corsOrigins: ['*'],
    updateInterval: 2000,
    maxClients: 100,
    enableWebSockets: true,
    enableSSE: true,
    verboseLogging: true
};

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║        🏗️  AIGO-SYNDICATE CONSTRUCTION GUI 🏗️              ║');
console.log('║                                                              ║');
console.log('║        Starting on 896GB Production Server                  ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

async function startServer() {
    try {
        console.log('🚀 Initializing Construction GUI Server...');
        console.log(`   Port: ${config.port}`);
        console.log(`   Host: ${config.host}`);
        console.log(`   Update Interval: ${config.updateInterval}ms`);
        console.log('');
        
        // Get server instance (singleton)
        const server = getConstructionGUIServer(config);
        
        // Initialize Express app and HTTP server before starting
        console.log('📦 Setting up server components...');
        server.createExpressApp();
        
        // Create HTTP server from Express app
        const { createServer } = await import('http');
        server.httpServer = createServer(server.app);
        
        // Initialize Socket.IO if WebSocket is enabled
        if (config.enableWebSockets) {
            const { Server } = await import('socket.io');
            server.io = new Server(server.httpServer, {
                cors: {
                    origin: config.corsOrigins,
                    credentials: true
                }
            });
            // WebSocket handlers will be set up automatically
        }
        
        // Start the server
        await server.start();
        
        console.log('');
        console.log('✅ Construction GUI Server is running!');
        console.log('');
        console.log('📍 Access points:');
        console.log(`   Local:    http://localhost:${config.port}`);
        console.log(`   Network:  http://162.55.83.33:${config.port}`);
        console.log('');
        console.log('📊 Features:');
        console.log('   ✓ Real-time monitoring dashboard');
        console.log('   ✓ Agent status tracking');
        console.log('   ✓ Construction project overview');
        console.log('   ✓ HOAI compliance monitoring');
        console.log('   ✓ Quantum state visualization');
        console.log('   ✓ WebSocket live updates');
        console.log('');
        console.log('Press Ctrl+C to stop the server');
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Start the server
startServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n📛 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n📛 Terminating...');
    process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
