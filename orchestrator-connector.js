#!/usr/bin/env node

/**
 * 🚀 ORCHESTRATOR CONNECTOR - Simple Integration
 * ============================================
 * 
 * Connects the AutonomousConstructionTaskOrchestrator to the existing
 * sophisticated GUI system via Socket.IO broadcasting.
 */

import { AutonomousConstructionTaskOrchestrator } from "./src/construction/autonomous/AutonomousConstructionTaskOrchestrator.js";
import { DatabasePoolManager } from "./src/database/DatabasePoolManager.js";
import { io as SocketIOClient } from "socket.io-client";

console.log("🚀 Starting Simple Orchestrator Connector...");

async function connectOrchestratorToGUI() {
    try {
        // Initialize database
        const dbManager = DatabasePoolManager.getInstance();
        await dbManager.initialize();
        const dbPool = await dbManager.getPool();
        console.log("✅ Database initialized");
        
        // Connect to existing GUI server via Socket.IO
        const guiClient = SocketIOClient("http://localhost:3001");
        
        guiClient.on("connect", () => {
            console.log("✅ Connected to existing GUI server");
        });
        
        guiClient.on("disconnect", () => {
            console.log("⚠️ Disconnected from GUI server");
        });
        
        // Initialize orchestrator
        const orchestrator = new AutonomousConstructionTaskOrchestrator({
            enableLearning: true,
            enableHOAIMonitoring: true,
            enableIndustryAnalysis: true,
            enableSelfImprovement: true,
            enableAgentCollaboration: true,
            maxConcurrentTasks: 10,
            learningIntensity: "maximum",
            streamingEnabled: true
        });
        
        // Create simple background task manager
        const mockBackgroundTaskManager = {
            registerTask: (taskConfig) => {
                console.log("📝 Registered task:", taskConfig.name);
                
                // Start task with interval
                if (taskConfig.handler) {
                    const runTask = async () => {
                        try {
                            await taskConfig.handler();
                        } catch (error) {
                            console.error("Task error:", error.message);
                        }
                    };
                    
                    // Run immediately then on interval
                    runTask();
                    setInterval(runTask, taskConfig.interval);
                }
            }
        };
        
        // Mock agents
        const mockAgents = new Map();
        mockAgents.set("architect", { name: "Senior Architect Agent", status: "active" });
        mockAgents.set("structural_engineer", { name: "Structural Engineer Agent", status: "active" });
        mockAgents.set("quantity_surveyor", { name: "Quantity Surveyor Agent", status: "active" });
        
        // Initialize orchestrator
        await orchestrator.initialize({
            backgroundTaskManager: mockBackgroundTaskManager,
            database: dbPool,
            agents: mockAgents
        });
        
        console.log("✅ AutonomousConstructionTaskOrchestrator initialized");
        
        // Listen to orchestrator events and broadcast to GUI
        orchestrator.on("autonomous_event", (event) => {
            console.log("📡 Broadcasting event:", event.subtype);
            
            // Broadcast to GUI clients
            guiClient.emit("orchestrator_event", event);
            
            // Also emit specific event types
            switch (event.subtype) {
                case "learning_progress":
                    guiClient.emit("learning_update", event.data);
                    break;
                case "hoai_compliance":
                    guiClient.emit("compliance_update", event.data);
                    break;
                case "industry_intelligence":
                    guiClient.emit("industry_update", event.data);
                    break;
                case "agent_collaboration":
                    guiClient.emit("collaboration_update", event.data);
                    break;
                case "capability_evolution":
                    guiClient.emit("evolution_update", event.data);
                    break;
            }
        });
        
        console.log("🎉 ORCHESTRATOR CONNECTOR OPERATIONAL!");
        console.log("🔗 Broadcasting autonomous intelligence events to GUI");
        
        // Status monitoring
        setInterval(() => {
            const status = orchestrator.getRealtimeStatus();
            console.log("📊 Orchestrator Status:");
            console.log("   🔄 Tasks executed:", status.metrics.totalTasksExecuted);
            console.log("   🧠 Knowledge items learned:", status.metrics.knowledgeItemsLearned);
            console.log("   🤝 Collaborations:", status.metrics.crossAgentCollaborations);
            
            // Broadcast status to GUI
            guiClient.emit("orchestrator_status", status);
        }, 30000); // Every 30 seconds
        
        // Keep alive
        process.on("SIGINT", () => {
            console.log("\n🛑 Shutting down orchestrator connector...");
            guiClient.disconnect();
            orchestrator.shutdown();
            process.exit(0);
        });
        
    } catch (error) {
        console.error("❌ Connector failed:", error.message);
        console.error("Stack:", error.stack);
        process.exit(1);
    }
}

connectOrchestratorToGUI();
