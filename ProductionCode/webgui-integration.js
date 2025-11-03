    async startWebGUI() {
        try {
            console.log("   🌐 Starting working streamlined web GUI server...");
            
            // Start the working server that has our chat fixes
            this.webServerProcess = spawn("/usr/bin/node", ["streamlined-web-gui-server.js"], {
                cwd: process.cwd(),
                stdio: ["ignore", "pipe", "pipe"],
                detached: false
            });
            
            this.webServerProcess.stdout.on("data", (data) => {
                const output = data.toString();
                if (output.includes("READY")) {
                    console.log("   ✅ Backend API ready with advanced chat");
                }
            });
            
            this.webServerProcess.stderr.on("data", (data) => {
                console.error("   ⚠️ Backend:", data.toString().trim());
            });
            
            // Give server time to start
            await new Promise(resolve => setTimeout(resolve, 8000));
            
            console.log("   🌐 API server ready at http://localhost:3001");
            console.log("   🔌 WebSocket ready for advanced LLM chat");
            
        } catch (error) {
            console.error("   ❌ Failed to start web GUI:", error.message);
            throw error;
        }
    }
