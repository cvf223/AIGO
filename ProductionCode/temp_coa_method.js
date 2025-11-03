    async applyChainOfAgentsReasoning(message, target) {
        console.log("   🔗 Applying Chain of Agents (CoA) reasoning...");
        return await this.ollama.processWithChainOfAgents(message, target);
    }
