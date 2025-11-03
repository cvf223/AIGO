/**
 * 🤖 CLEAN OLLAMA INTEGRATION FOR ADVANCED MODELS
 * ==============================================
 */

class OllamaIntegration {
    constructor() {
        this.baseUrl = "http://localhost:11434";
        this.defaultModel = "qwen2.5:72b-instruct-fp16";
        this.visionModel = "llava:34b";
        this.codeModel = "llama3.3:70b";
    }

    async makeOllamaRequest(model, prompt, system = "") {
        try {
            console.log(`🧠 Requesting ${model}...`);
            
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    system: system,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        max_tokens: 2000,
                        top_p: 0.9
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.response || "No response";
            
        } catch (error) {
            console.error("Ollama error:", error.message);
            return `Error: ${error.message}`;
        }
    }

    async routeToConstructionSpecialist(message, target) {
        const system = `You are a German construction specialist. Answer professionally in German about construction, architecture, HOAI standards, and building regulations.`;
        
        const prompt = `Benutzer fragt: "${message}"

Als Experte für deutsche Architektur und Bauwesen, gib eine professionelle Antwort auf Deutsch. Berücksichtige:
- HOAI-Standards und Leistungsphasen
- Deutsche Bauvorschriften (DIN, VOB)
- Praktische Umsetzung
- Spezifische Empfehlungen

Antworte detailliert und fachlich korrekt.`;

        return await this.makeOllamaRequest(this.defaultModel, prompt, system);
    }

    async processWithChainOfAgents(message, target) {
        const system = "You are coordinating multiple construction specialists for comprehensive analysis.";
        const prompt = `Analyze: "${message}" using multi-agent coordination for ${target.name}.`;
        return await this.makeOllamaRequest(this.defaultModel, prompt, system);
    }

    async processWithTreeOfThought(message, target) {
        const system = "Use systematic tree-of-thought reasoning for construction analysis.";
        const prompt = `Tree analysis: "${message}" for specialist ${target.name}.`;
        return await this.makeOllamaRequest(this.defaultModel, prompt, system);
    }

    async processWithGraphOfThought(message, target) {
        const system = "Map interconnected concepts in construction networks.";
        const prompt = `Graph analysis: "${message}" for ${target.name}.`;
        return await this.makeOllamaRequest(this.defaultModel, prompt, system);
    }
}

export default OllamaIntegration;
