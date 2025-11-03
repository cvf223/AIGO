#!/usr/bin/env node

/**
 * 🚀 FRESH SOPHISTICATED GUI LAUNCHER - No Module Caching
 * ======================================================
 */

console.log("🚀 Starting FRESH Sophisticated GUI (bypassing module cache)...");

async function startFreshGUI() {
    try {
        // Force fresh imports by using timestamp
        const timestamp = Date.now();
        console.log(`🔄 Loading fresh modules (${timestamp})...`);
        
        // Import fresh instances
        const { DatabasePoolManager } = await import(`./src/database/DatabasePoolManager.js?t=${timestamp}`);
        const { GraphQLConstructionServer } = await import(`./src/web/GraphQLConstructionServer.js?t=${timestamp}`);
        const { getConstructionGUIServer } = await import(`./src/web/construction-gui-server.js?t=${timestamp}`);
        
        console.log("✅ Fresh modules loaded");
        
        // Test DatabasePoolManager first
        const dbManager = DatabasePoolManager.getInstance();
        await dbManager.initialize();
        const pool = await dbManager.getPool();
        console.log("✅ DatabasePoolManager with getPool() confirmed working");
        
        // Start GraphQL server with explicit database manager reference
        const graphqlServer = new GraphQLConstructionServer({
            port: 4000,
            host: "0.0.0.0",
            database: pool
        });
        
        // Important: Initialize database BEFORE calling graphqlServer.initialize()
        console.log("🔧 Pre-setting database manager in GraphQL server...");
        graphqlServer.dbManager = dbManager;
        graphqlServer.dbPool = pool;
        
        // Skip database initialization in GraphQL server
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
        
        console.log("🎉 FRESH SOPHISTICATED GUI SYSTEM READY!");
        console.log("🌟 GraphQL Playground: http://162.55.83.33:4000/graphql");
        console.log("💻 Main Interface: http://162.55.83.33:3001");
        
    } catch (error) {
        console.error("❌ Fresh GUI failed to start:", error.message);
        console.log("Stack:", error.stack);
        process.exit(1);
    }
}

startFreshGUI();
