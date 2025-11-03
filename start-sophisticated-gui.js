#!/usr/bin/env node

/**
 * 🚀 STANDALONE SOPHISTICATED GUI LAUNCHER - FIXED VERSION
 * ========================================================
 */

import { GraphQLConstructionServer } from "./src/web/GraphQLConstructionServer.js";
import { getConstructionGUIServer } from "./src/web/construction-gui-server.js";
import { getUnifiedDatabase } from "./src/database/UnifiedDatabaseConfig.js";
import { DatabasePoolManager } from "./src/database/DatabasePoolManager.js";

console.log("🚀 Starting Standalone Sophisticated GUI (Fixed Version)...");

async function startSophisticatedGUI() {
    try {
        // Initialize database pool manager
        const dbManager = DatabasePoolManager.getInstance();
        await dbManager.initialize();
        const db = await dbManager.getPool();
        console.log("✅ Database Pool Manager initialized");
        
        // Start GraphQL server with proper database
        const graphqlServer = new GraphQLConstructionServer({
            port: 4000,
            host: "0.0.0.0",
            database: db
        });
        
        // Set database manager reference
        graphqlServer.dbManager = dbManager;
        
        await graphqlServer.initialize();
        await graphqlServer.start();
        console.log("✅ GraphQL Server running on http://162.55.83.33:4000/graphql");
        
        // Start GUI server
        const guiServer = getConstructionGUIServer({
            port: 3001,
            host: "0.0.0.0",
            enableWebSocket: true,
            database: db
        });
        
        await guiServer.initialize();
        await guiServer.start();
        console.log("✅ GUI Server running on http://162.55.83.33:3001");
        
        console.log("🎉 SOPHISTICATED GUI SYSTEM READY!");
        console.log("🌟 GraphQL Playground: http://162.55.83.33:4000/graphql");
        console.log("💻 Main Interface: http://162.55.83.33:3001");
        
    } catch (error) {
        console.error("❌ Sophisticated GUI failed to start:", error.message);
        console.log("   Stack:", error.stack);
        console.log("⚠️ Will retry in 60 seconds...");
        setTimeout(startSophisticatedGUI, 60000);
    }
}

startSophisticatedGUI();
