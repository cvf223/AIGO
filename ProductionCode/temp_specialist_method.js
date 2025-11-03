    async routeToConstructionSpecialist(message, target, reasoningConfig) {
        console.log(`   🏗️ Routing to construction specialist: ${target.id}`);
        
        try {
            const response = await this.ollama.routeToConstructionSpecialist(message, target);
            console.log(`   ✅ Specialist response generated: ${response.length} characters`);
            return response;
        } catch (error) {
            console.error(`   ❌ Specialist routing failed:`, error.message);
            return `❌ Sorry, there was an error processing your request: ${error.message}`;
        }
    }
