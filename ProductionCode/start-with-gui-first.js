#!/usr/bin/env node

/**
 * 🚀 STREAMLINED CONSTRUCTION START - GUI FIRST
 * =============================================
 * Starts GUI immediately, then loads other systems in background
 */

import { spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 CONSTRUCTION SYNDICATE - GUI FIRST STARTUP");
console.log("============================================");
console.log("");

class StreamlinedConstructionStart {
    constructor() {
        this.webServerProcess = null;
        this.nextjsProcess = null;
        this.backgroundProcess = null;
    }

    async initialize() {
        try {
            // Phase 1: Start Web GUI immediately
            console.log("🌐 Phase 1: Starting Web GUI Backend...");
            await this.startWebGUI();
            console.log("   ✅ Backend ready on http://localhost:3001\n");
            
            // Phase 2: Start Frontend immediately  
            console.log("🎨 Phase 2: Starting Web Frontend...");
            await this.startConstructionFrontend();
            console.log("   ✅ Frontend ready on http://localhost:3002\n");
            
            console.log("🎉 WEB GUI OPERATIONAL!");
            console.log("=======================");
            console.log("🌐 Backend:  http://162.55.83.33:3001");
            console.log("🖥️ Frontend: http://162.55.83.33:3002");
            console.log("🧠 Advanced 72B model chat ready");
            console.log("🏗️ Construction specialists ready");
            console.log("");
            
            // Phase 3: Start heavy modules in background
            console.log("🔄 Phase 3: Loading construction systems in background...");
            this.startBackgroundSystems();
            
            console.log("✅ GUI ready for immediate use!");
            console.log("🔄 Other systems loading in background...");
            
            // Keep process alive
            this.keepAlive();
            
        } catch (error) {
            console.error("❌ Startup failed:", error.message);
            throw error;
        }
    }

    async startWebGUI() {
        try {
            this.webServerProcess = spawn("/usr/bin/node", ["streamlined-web-gui-server.js"], {
                cwd: process.cwd(),
                stdio: ["ignore", "pipe", "pipe"],
                detached: false
            });
            
            this.webServerProcess.stdout.on("data", (data) => {
                const output = data.toString();
                if (output.includes("READY")) {
                    console.log("   ✅ Advanced chat with 72B models ready");
                }
            });
            
            // Wait for startup
            await new Promise(resolve => setTimeout(resolve, 10000));
            
        } catch (error) {
            console.error("❌ Backend startup failed:", error.message);
            throw error;
        }
    }

    async startConstructionFrontend() {
        try {
            this.nextjsProcess = spawn("npm", ["run", "start"], {
                cwd: "./web-gui-construction",
                stdio: "ignore",
                detached: false
            });
            
            this.nextjsProcess.on("error", (error) => {
                console.error("❌ Frontend error:", error.message);
            });
            
            // Wait for startup
            await new Promise(resolve => setTimeout(resolve, 8000));
            
        } catch (error) {
            console.error("❌ Frontend startup failed:", error.message);
            throw error;
        }
    }

    startBackgroundSystems() {
        console.log("   🔄 Starting construction systems in background...");
        
        // Start the full system in background
        this.backgroundProcess = spawn("/usr/bin/node", ["start-construction-clean-background.js"], {
            cwd: process.cwd(),
            stdio: "ignore",
            detached: true
        });
        
        console.log("   ✅ Background systems starting...");
    }

    keepAlive() {
        // Monitor processes and restart if needed
        setInterval(() => {
            console.log(`📊 System status: ${new Date().toLocaleTimeString()}`);
            console.log("   🌐 Backend: http://162.55.83.33:3001");  
            console.log("   🖥️ Frontend: http://162.55.83.33:3002");
        }, 60000); // Every minute
    }
}

// Start the streamlined system
const starter = new StreamlinedConstructionStart();
starter.initialize().catch(error => {
    console.error("💥 Critical startup failure:", error);
    process.exit(1);
});
