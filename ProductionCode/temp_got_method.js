    async applyGraphOfThoughtReasoning(message, target) {
        console.log("   🕸️ Applying Graph of Thought (GoT) reasoning...");
        return await this.ollama.processWithGraphOfThought(message, target);
    }
