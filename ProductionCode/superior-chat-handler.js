/**
 * 🧠 SUPERIOR CHAT HANDLER FOR ADVANCED MODELS
 * ============================================
 * Handles 70B+ models with proper async architecture
 */

class SuperiorChatHandler {
    constructor(ollama, socket, clientId) {
        this.ollama = ollama;
        this.socket = socket;
        this.clientId = clientId;
        this.keepAliveInterval = null;
    }

    async handleAdvancedChat(message, target, reasoningConfig) {
        const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`🧠 Superior processing for advanced model: ${target.id}`);
        
        try {
            // Start keep-alive for long processing
            this.startKeepAlive(streamId);
            
            // Initial response
            this.socket.emit(chat:streaming, {
                streamId: streamId,
                content: `🧠 Initializing advanced AI processing for ${target.name}...`,
                status: initializing,
                timestamp: Date.now()
            });

            // Process with advanced reasoning
            let response = ;
            
            if (reasoningConfig.enableCoA) {
                this.updateProgress(streamId, Chain of Agents reasoning...);
                response += await this.ollama.processWithChainOfAgents(message, target);
            }
            
            if (reasoningConfig.enableToT) {
                this.updateProgress(streamId, Tree of Thought analysis...);
                response += await this.ollama.processWithTreeOfThought(message, target);
            }
            
            if (reasoningConfig.enableGoT) {
                this.updateProgress(streamId, Graph of Thought mapping...);
                response += await this.ollama.processWithGraphOfThought(message, target);
            }
            
            if (!response) {
                // Direct specialist routing
                this.updateProgress(streamId, Specialist analysis...);
                response = await this.ollama.routeToConstructionSpecialist(message, target);
            }

            // Stop keep-alive
            this.stopKeepAlive();

            // Stream final response
            await this.streamResponse(streamId, response, target);

        } catch (error) {
            this.stopKeepAlive();
            console.error(`❌ Superior chat processing failed:`, error.message);
            
            this.socket.emit(chat:response, {
                streamId: streamId,
                from: target.name || target.id,
                response: `❌ Advanced AI processing encountered an error: ${error.message}`,
                error: true,
                timestamp: Date.now(),
                completed: true
            });
        }
    }

    startKeepAlive(streamId) {
        this.keepAliveInterval = setInterval(() => {
            if (this.socket && this.socket.connected) {
                this.socket.emit(chat:keepalive, {
                    streamId: streamId,
                    status: processing,
                    message: Advanced AI model processing...,
                    timestamp: Date.now()
                });
            }
        }, 10000); // Every 10 seconds
    }

    stopKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
        }
    }

    updateProgress(streamId, status) {
        this.socket.emit(chat:streaming, {
            streamId: streamId,
            content: `🧠 ${status}`,
            status: progress,
            timestamp: Date.now()
        });
    }

    async streamResponse(streamId, response, target) {
        const words = response.split( );
        let streamedContent = ;
        
        for (let i = 0; i < words.length; i++) {
            streamedContent += words[i] +  ;
            
            this.socket.emit(chat:streaming, {
                streamId: streamId,
                content: streamedContent,
                chunk: words[i] +  ,
                progress: (i + 1) / words.length,
                timestamp: Date.now()
            });
            
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Send completion
        this.socket.emit(chat:response, {
            streamId: streamId,
            from: target.name || target.id,
            response: response,
            completed: true,
            timestamp: Date.now()
        });
    }
}

export default SuperiorChatHandler;
