import type { IAgentRuntime, Relationship, UUID } from "./types";
export declare function createRelationship({ runtime, userA, userB, }: {
    runtime: IAgentRuntime;
    userA: UUID;
    userB: UUID;
}): Promise<boolean>;
export declare function getRelationship({ runtime, userA, userB, }: {
    runtime: IAgentRuntime;
    userA: UUID;
    userB: UUID;
}): Promise<Relationship | null>;
export declare function getRelationships({ runtime, userId, }: {
    runtime: IAgentRuntime;
    userId: UUID;
}): Promise<Relationship[]>;
export declare function formatRelationships({ runtime, userId, }: {
    runtime: IAgentRuntime;
    userId: UUID;
}): Promise<UUID[]>;
//# sourceMappingURL=relationships.d.ts.map