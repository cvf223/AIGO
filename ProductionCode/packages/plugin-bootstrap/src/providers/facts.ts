import {
    embed,
    MemoryManager,
    formatMessages,
    type AgentRuntime as IAgentRuntime,
} from "@elizaos/core";
import type { Memory, Provider, State } from "@elizaos/core";
import { formatFacts } from "../evaluators/fact";

export const factsProvider: Provider = {
    get: async (runtime, message, state) => {
        const recentMessagesData = Array.isArray(state?.recentMessagesData) ? state.recentMessagesData.slice(-10) : [];
        const actorsData = Array.isArray(state?.actorsData) ? state.actorsData : [];

        const recentMessages = formatMessages({
            messages: recentMessagesData,
            actors: actorsData,
        });

        const embedding = await embed(runtime, recentMessages);

        const memoryManager = new MemoryManager({
            runtime: runtime as any,
            tableName: "facts",
        });

        const relevantFacts = await memoryManager.searchMemoriesByEmbedding(
            embedding,
            {
                roomId: message.roomId,
                count: 10,
            }
        ) || [];

        const recentFactsData = await memoryManager.getMemories({
            roomId: message.roomId,
            count: 10,
            start: 0,
            end: Date.now(),
        }) || [];

        // join the two and deduplicate
        const allFacts = [...relevantFacts, ...recentFactsData].filter(
            (fact, index, self) =>
                index === self.findIndex((t) => t.id === fact.id)
        );

        if (allFacts.length === 0) {
            return "";
        }

        const formattedFacts = formatFacts(allFacts);

        return "Key facts that {{agentName}} knows:\n{{formattedFacts}}"
            .replace("{{agentName}}", runtime.character.name)
            .replace("{{formattedFacts}}", formattedFacts);
    },
};
