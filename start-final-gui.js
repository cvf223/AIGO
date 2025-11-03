#!/usr/bin/env node

/**
 * 🚀 FINAL SOPHISTICATED GUI LAUNCHER
 * ==================================
 */

import { DatabasePoolManager } from "./src/database/DatabasePoolManager.js";
import { GraphQLConstructionServer } from "./src/web/GraphQLConstructionServer.js";
import { getConstructionGUIServer } from "./src/web/construction-gui-server.js";

console.log("🚀 Starting FINAL Sophisticated GUI...");

async function startFinalGUI() {
    try {
        // Initialize single database manager
        const dbManager = DatabasePoolManager.getInstance();
        await dbManager.initialize();
        const pool = await dbManager.getPool();
        console.log("✅ DatabasePoolManager initialized and getPool() working");
        
        // Create GraphQL server
        const graphqlServer = new GraphQLConstructionServer({
            port: 4000,
            host: "0.0.0.0"
        });
        
        // Pre-set database connections to skip internal initialization
        graphqlServer.dbManager = dbManager;
        graphqlServer.dbPool = pool;
        
        // Override the initializeDatabase method to do nothing since we pre-set everything
        const originalInitializeDatabase = graphqlServer.initializeDatabase;
        graphqlServer.initializeDatabase = async function() {
            console.log("🗄️ Using pre-initialized database connection...");
            // Database already set, skip initialization
        };
        
        await graphqlServer.initialize();
        await graphqlServer.start();
        console.log("✅ GraphQL Server running on http://162.55.83.33:4000/graphql");
        
        // Start GUI server
        const guiServer = getConstructionGUIServer({
            port: 3001,
            host: "0.0.0.0",
            enableWebSocket: true,
            database: pool
        });
        
        await guiServer.initialize();
        await guiServer.start();
        console.log("✅ GUI Server running on http://162.55.83.33:3001");
        
        console.log("🎉 FINAL SOPHISTICATED GUI SYSTEM READY!");
        console.log("🌟 GraphQL Playground: http://162.55.83.33:4000/graphql");
        console.log("💻 Main Interface: http://162.55.83.33:3001");
        
        // Keep the process alive
        process.on('SIGINT', () => {
            console.log("\\n🛑 Shutting down sophisticated GUI...");
            process.exit(0);
        });
        
    } catch (error) {
        console.error("❌ Final GUI failed to start:", error.message);
        console.log("Stack:", error.stack);
        process.exit(1);
    }
}

startFinalGUI();
