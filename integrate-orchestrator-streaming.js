#!/usr/bin/env node

/**
 * 🚀 ORCHESTRATOR-STREAMING INTEGRATION SCRIPT
 */

import { AutonomousConstructionTaskOrchestrator } from "./src/construction/autonomous/AutonomousConstructionTaskOrchestrator.js";
import { StreamingGateway } from "./src/web/StreamingGateway.js";
import { DatabasePoolManager } from "./src/database/DatabasePoolManager.js";
import { createServer } from "http";

console.log("🚀 Starting Orchestrator-Streaming Integration...");

async function integrateOrchestratorStreaming() {
    try {
        // Initialize database
        const dbManager = DatabasePoolManager.getInstance();
        await dbManager.initialize();
        const dbPool = await dbManager.getPool();
        console.log("✅ Database initialized for integration");
        
        // Create HTTP server for streaming gateway
        const httpServer = createServer();
        console.log("✅ HTTP server created for streaming");
        
        // Initialize StreamingGateway
        const streamingGateway = new StreamingGateway({
            enableCompression: true,
            bufferSize: 1000,
            flushInterval: 100,
            channels: ["autonomous", "learning", "compliance", "industry", "collaboration", "evolution", "tasks"]
        });
        
        await streamingGateway.initialize(httpServer);
        console.log("✅ StreamingGateway initialized");
        
        // Initialize AutonomousConstructionTaskOrchestrator
        const orchestrator = new AutonomousConstructionTaskOrchestrator({
            enableLearning: true,
            enableHOAIMonitoring: true,
            enableIndustryAnalysis: true,
            enableSelfImprovement: true,
            enableAgentCollaboration: true,
            maxConcurrentTasks: 15,
            learningIntensity: "maximum",
            streamingEnabled: true
        });
        
        // Create mock background task manager
        const mockBackgroundTaskManager = {
            registerTask: (taskConfig) => {
                console.log("📝 Registered task:", taskConfig.name, "(" + taskConfig.interval + "ms)");
                
                // Start the task immediately and then set interval
                if (taskConfig.handler) {
                    taskConfig.handler();
                    setInterval(taskConfig.handler, taskConfig.interval);
                }
            }
        };
        
        // Mock agents map
        const mockAgents = new Map();
        mockAgents.set("architect", { name: "Senior Architect Agent", status: "active" });
        mockAgents.set("structural_engineer", { name: "Structural Engineer Agent", status: "active" });
        mockAgents.set("quantity_surveyor", { name: "Quantity Surveyor Agent", status: "active" });
        
        // Initialize orchestrator with dependencies
        await orchestrator.initialize({
            backgroundTaskManager: mockBackgroundTaskManager,
            database: dbPool,
            agents: mockAgents,
            streamingGateway: streamingGateway
        });
        
        console.log("✅ AutonomousConstructionTaskOrchestrator initialized");
        
        // Connect orchestrator to streaming gateway
        streamingGateway.connectOrchestrator(orchestrator);
        console.log("✅ Orchestrator connected to StreamingGateway");
        
        // Start streaming server
        httpServer.listen(3002, "0.0.0.0", () => {
            console.log("🌟 Streaming Gateway server running on http://162.55.83.33:3002");
        });
        
        console.log("🎉 ORCHESTRATOR-STREAMING INTEGRATION COMPLETE!");
        console.log("🌟 Real-time autonomous intelligence streaming is now active!");
        console.log("🔗 Connect to ws://162.55.83.33:3002 to receive live events");
        
        // Monitor streaming status every 30 seconds
        setInterval(() => {
            const orchestratorStatus = streamingGateway.getOrchestratorStatus();
            const streamMetrics = streamingGateway.getMetrics();
            
            console.log("📊 STREAMING STATUS:");
            console.log("   🔗 Orchestrator:", orchestratorStatus.connected ? "Connected" : "Disconnected");
            console.log("   📡 Clients:", streamMetrics.connectedClients);
            console.log("   📝 Events streamed:", streamMetrics.totalEventsSent);
        }, 30000);
        
        // Keep the process alive
        process.on("SIGINT", () => {
            console.log("\n🛑 Shutting down orchestrator-streaming integration...");
            orchestrator.shutdown();
            process.exit(0);
        });
        
    } catch (error) {
        console.error("❌ Integration failed:", error.message);
        console.error("Stack:", error.stack);
        process.exit(1);
    }
}

integrateOrchestratorStreaming();
