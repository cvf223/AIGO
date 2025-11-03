    async applyTreeOfThoughtReasoning(message, target) {
        console.log("   🌳 Applying Tree of Thought (ToT) reasoning...");
        return await this.ollama.processWithTreeOfThought(message, target);
    }
