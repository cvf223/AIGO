import { z } from "zod";
import { ModelProviderName } from "./types";
export declare const envSchema: z.ZodObject<{
    OPENAI_API_KEY: z.ZodString;
    REDPILL_API_KEY: z.ZodString;
    GROK_API_KEY: z.ZodString;
    GROQ_API_KEY: z.ZodString;
    OPENROUTER_API_KEY: z.ZodString;
    GOOGLE_GENERATIVE_AI_API_KEY: z.ZodString;
    ELEVENLABS_XI_API_KEY: z.ZodString;
}, "strip", z.ZodTypeAny, {
    OPENAI_API_KEY: string;
    REDPILL_API_KEY: string;
    GROK_API_KEY: string;
    GROQ_API_KEY: string;
    OPENROUTER_API_KEY: string;
    GOOGLE_GENERATIVE_AI_API_KEY: string;
    ELEVENLABS_XI_API_KEY: string;
}, {
    OPENAI_API_KEY: string;
    REDPILL_API_KEY: string;
    GROK_API_KEY: string;
    GROQ_API_KEY: string;
    OPENROUTER_API_KEY: string;
    GOOGLE_GENERATIVE_AI_API_KEY: string;
    ELEVENLABS_XI_API_KEY: string;
}>;
export type EnvConfig = z.infer<typeof envSchema>;
export declare function validateEnv(): EnvConfig;
export declare const CharacterSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    system: z.ZodOptional<z.ZodString>;
    modelProvider: z.ZodNativeEnum<typeof ModelProviderName>;
    modelEndpointOverride: z.ZodOptional<z.ZodString>;
    templates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    bio: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    lore: z.ZodArray<z.ZodString, "many">;
    messageExamples: z.ZodArray<z.ZodArray<z.ZodObject<{
        user: z.ZodString;
        content: z.ZodIntersection<z.ZodObject<{
            text: z.ZodString;
            action: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
            inReplyTo: z.ZodOptional<z.ZodString>;
            attachments: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        }, "strip", z.ZodTypeAny, {
            text: string;
            action?: string | undefined;
            source?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
        }, {
            text: string;
            action?: string | undefined;
            source?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
        }>, z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        user: string;
        content: {
            text: string;
            action?: string | undefined;
            source?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
        } & Record<string, unknown>;
    }, {
        user: string;
        content: {
            text: string;
            action?: string | undefined;
            source?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
        } & Record<string, unknown>;
    }>, "many">, "many">;
    postExamples: z.ZodArray<z.ZodString, "many">;
    topics: z.ZodArray<z.ZodString, "many">;
    adjectives: z.ZodArray<z.ZodString, "many">;
    knowledge: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        path: z.ZodString;
        shared: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        shared?: boolean | undefined;
    }, {
        path: string;
        shared?: boolean | undefined;
    }>, z.ZodObject<{
        directory: z.ZodString;
        shared: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        directory: string;
        shared?: boolean | undefined;
    }, {
        directory: string;
        shared?: boolean | undefined;
    }>]>, "many">>;
    plugins: z.ZodUnion<[z.ZodArray<z.ZodString, "many">, z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        actions: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        providers: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        evaluators: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        services: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        clients: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        actions?: any[] | undefined;
        providers?: any[] | undefined;
        evaluators?: any[] | undefined;
        services?: any[] | undefined;
        clients?: any[] | undefined;
    }, {
        name: string;
        description: string;
        actions?: any[] | undefined;
        providers?: any[] | undefined;
        evaluators?: any[] | undefined;
        services?: any[] | undefined;
        clients?: any[] | undefined;
    }>, "many">]>;
    settings: z.ZodOptional<z.ZodObject<{
        secrets: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        voice: z.ZodOptional<z.ZodObject<{
            model: z.ZodOptional<z.ZodString>;
            url: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            url?: string | undefined;
            model?: string | undefined;
        }, {
            url?: string | undefined;
            model?: string | undefined;
        }>>;
        model: z.ZodOptional<z.ZodString>;
        modelConfig: z.ZodOptional<z.ZodObject<{
            maxInputTokens: z.ZodOptional<z.ZodNumber>;
            maxOutputTokens: z.ZodOptional<z.ZodNumber>;
            temperature: z.ZodOptional<z.ZodNumber>;
            frequency_penalty: z.ZodOptional<z.ZodNumber>;
            presence_penalty: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxInputTokens?: number | undefined;
            maxOutputTokens?: number | undefined;
            frequency_penalty?: number | undefined;
            presence_penalty?: number | undefined;
            temperature?: number | undefined;
        }, {
            maxInputTokens?: number | undefined;
            maxOutputTokens?: number | undefined;
            frequency_penalty?: number | undefined;
            presence_penalty?: number | undefined;
            temperature?: number | undefined;
        }>>;
        embeddingModel: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model?: string | undefined;
        secrets?: Record<string, string> | undefined;
        voice?: {
            url?: string | undefined;
            model?: string | undefined;
        } | undefined;
        modelConfig?: {
            maxInputTokens?: number | undefined;
            maxOutputTokens?: number | undefined;
            frequency_penalty?: number | undefined;
            presence_penalty?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
        embeddingModel?: string | undefined;
    }, {
        model?: string | undefined;
        secrets?: Record<string, string> | undefined;
        voice?: {
            url?: string | undefined;
            model?: string | undefined;
        } | undefined;
        modelConfig?: {
            maxInputTokens?: number | undefined;
            maxOutputTokens?: number | undefined;
            frequency_penalty?: number | undefined;
            presence_penalty?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
        embeddingModel?: string | undefined;
    }>>;
    clientConfig: z.ZodOptional<z.ZodObject<{
        discord: z.ZodOptional<z.ZodObject<{
            shouldIgnoreBotMessages: z.ZodOptional<z.ZodBoolean>;
            shouldIgnoreDirectMessages: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
        }, {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
        }>>;
        telegram: z.ZodOptional<z.ZodObject<{
            shouldIgnoreBotMessages: z.ZodOptional<z.ZodBoolean>;
            shouldIgnoreDirectMessages: z.ZodOptional<z.ZodBoolean>;
            shouldRespondOnlyToMentions: z.ZodOptional<z.ZodBoolean>;
            shouldOnlyJoinInAllowedGroups: z.ZodOptional<z.ZodBoolean>;
            allowedGroupIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            messageSimilarityThreshold: z.ZodOptional<z.ZodNumber>;
            isPartOfTeam: z.ZodOptional<z.ZodBoolean>;
            teamAgentIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            teamLeaderId: z.ZodOptional<z.ZodString>;
            teamMemberUsernames: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            teamMemberInterestKeywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            autoPost: z.ZodOptional<z.ZodObject<{
                enabled: z.ZodOptional<z.ZodBoolean>;
                monitorTime: z.ZodOptional<z.ZodNumber>;
                inactivityThreshold: z.ZodOptional<z.ZodNumber>;
                mainChannelId: z.ZodOptional<z.ZodString>;
                pinnedMessagesGroups: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                minTimeBetweenPosts: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                enabled?: boolean | undefined;
                monitorTime?: number | undefined;
                inactivityThreshold?: number | undefined;
                mainChannelId?: string | undefined;
                pinnedMessagesGroups?: string[] | undefined;
                minTimeBetweenPosts?: number | undefined;
            }, {
                enabled?: boolean | undefined;
                monitorTime?: number | undefined;
                inactivityThreshold?: number | undefined;
                mainChannelId?: string | undefined;
                pinnedMessagesGroups?: string[] | undefined;
                minTimeBetweenPosts?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
            shouldRespondOnlyToMentions?: boolean | undefined;
            shouldOnlyJoinInAllowedGroups?: boolean | undefined;
            allowedGroupIds?: string[] | undefined;
            messageSimilarityThreshold?: number | undefined;
            isPartOfTeam?: boolean | undefined;
            teamAgentIds?: string[] | undefined;
            teamLeaderId?: string | undefined;
            teamMemberUsernames?: Record<string, string> | undefined;
            teamMemberInterestKeywords?: string[] | undefined;
            autoPost?: {
                enabled?: boolean | undefined;
                monitorTime?: number | undefined;
                inactivityThreshold?: number | undefined;
                mainChannelId?: string | undefined;
                pinnedMessagesGroups?: string[] | undefined;
                minTimeBetweenPosts?: number | undefined;
            } | undefined;
        }, {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
            shouldRespondOnlyToMentions?: boolean | undefined;
            shouldOnlyJoinInAllowedGroups?: boolean | undefined;
            allowedGroupIds?: string[] | undefined;
            messageSimilarityThreshold?: number | undefined;
            isPartOfTeam?: boolean | undefined;
            teamAgentIds?: string[] | undefined;
            teamLeaderId?: string | undefined;
            teamMemberUsernames?: Record<string, string> | undefined;
            teamMemberInterestKeywords?: string[] | undefined;
            autoPost?: {
                enabled?: boolean | undefined;
                monitorTime?: number | undefined;
                inactivityThreshold?: number | undefined;
                mainChannelId?: string | undefined;
                pinnedMessagesGroups?: string[] | undefined;
                minTimeBetweenPosts?: number | undefined;
            } | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        discord?: {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
        } | undefined;
        telegram?: {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
            shouldRespondOnlyToMentions?: boolean | undefined;
            shouldOnlyJoinInAllowedGroups?: boolean | undefined;
            allowedGroupIds?: string[] | undefined;
            messageSimilarityThreshold?: number | undefined;
            isPartOfTeam?: boolean | undefined;
            teamAgentIds?: string[] | undefined;
            teamLeaderId?: string | undefined;
            teamMemberUsernames?: Record<string, string> | undefined;
            teamMemberInterestKeywords?: string[] | undefined;
            autoPost?: {
                enabled?: boolean | undefined;
                monitorTime?: number | undefined;
                inactivityThreshold?: number | undefined;
                mainChannelId?: string | undefined;
                pinnedMessagesGroups?: string[] | undefined;
                minTimeBetweenPosts?: number | undefined;
            } | undefined;
        } | undefined;
    }, {
        discord?: {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
        } | undefined;
        telegram?: {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
            shouldRespondOnlyToMentions?: boolean | undefined;
            shouldOnlyJoinInAllowedGroups?: boolean | undefined;
            allowedGroupIds?: string[] | undefined;
            messageSimilarityThreshold?: number | undefined;
            isPartOfTeam?: boolean | undefined;
            teamAgentIds?: string[] | undefined;
            teamLeaderId?: string | undefined;
            teamMemberUsernames?: Record<string, string> | undefined;
            teamMemberInterestKeywords?: string[] | undefined;
            autoPost?: {
                enabled?: boolean | undefined;
                monitorTime?: number | undefined;
                inactivityThreshold?: number | undefined;
                mainChannelId?: string | undefined;
                pinnedMessagesGroups?: string[] | undefined;
                minTimeBetweenPosts?: number | undefined;
            } | undefined;
        } | undefined;
    }>>;
    style: z.ZodObject<{
        all: z.ZodArray<z.ZodString, "many">;
        chat: z.ZodArray<z.ZodString, "many">;
        post: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        all: string[];
        chat: string[];
        post: string[];
    }, {
        all: string[];
        chat: string[];
        post: string[];
    }>;
    twitterProfile: z.ZodOptional<z.ZodObject<{
        username: z.ZodString;
        screenName: z.ZodString;
        bio: z.ZodString;
        nicknames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        bio: string;
        username: string;
        screenName: string;
        nicknames?: string[] | undefined;
    }, {
        bio: string;
        username: string;
        screenName: string;
        nicknames?: string[] | undefined;
    }>>;
    nft: z.ZodOptional<z.ZodObject<{
        prompt: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        prompt?: string | undefined;
    }, {
        prompt?: string | undefined;
    }>>;
    extends: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    bio: string | string[];
    lore: string[];
    name: string;
    modelProvider: ModelProviderName;
    topics: string[];
    messageExamples: {
        user: string;
        content: {
            text: string;
            action?: string | undefined;
            source?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
        } & Record<string, unknown>;
    }[][];
    postExamples: string[];
    adjectives: string[];
    plugins: string[] | {
        name: string;
        description: string;
        actions?: any[] | undefined;
        providers?: any[] | undefined;
        evaluators?: any[] | undefined;
        services?: any[] | undefined;
        clients?: any[] | undefined;
    }[];
    style: {
        all: string[];
        chat: string[];
        post: string[];
    };
    knowledge?: (string | {
        path: string;
        shared?: boolean | undefined;
    } | {
        directory: string;
        shared?: boolean | undefined;
    })[] | undefined;
    settings?: {
        model?: string | undefined;
        secrets?: Record<string, string> | undefined;
        voice?: {
            url?: string | undefined;
            model?: string | undefined;
        } | undefined;
        modelConfig?: {
            maxInputTokens?: number | undefined;
            maxOutputTokens?: number | undefined;
            frequency_penalty?: number | undefined;
            presence_penalty?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
        embeddingModel?: string | undefined;
    } | undefined;
    id?: string | undefined;
    system?: string | undefined;
    modelEndpointOverride?: string | undefined;
    templates?: Record<string, string> | undefined;
    clientConfig?: {
        discord?: {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
        } | undefined;
        telegram?: {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
            shouldRespondOnlyToMentions?: boolean | undefined;
            shouldOnlyJoinInAllowedGroups?: boolean | undefined;
            allowedGroupIds?: string[] | undefined;
            messageSimilarityThreshold?: number | undefined;
            isPartOfTeam?: boolean | undefined;
            teamAgentIds?: string[] | undefined;
            teamLeaderId?: string | undefined;
            teamMemberUsernames?: Record<string, string> | undefined;
            teamMemberInterestKeywords?: string[] | undefined;
            autoPost?: {
                enabled?: boolean | undefined;
                monitorTime?: number | undefined;
                inactivityThreshold?: number | undefined;
                mainChannelId?: string | undefined;
                pinnedMessagesGroups?: string[] | undefined;
                minTimeBetweenPosts?: number | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    twitterProfile?: {
        bio: string;
        username: string;
        screenName: string;
        nicknames?: string[] | undefined;
    } | undefined;
    nft?: {
        prompt?: string | undefined;
    } | undefined;
    extends?: string[] | undefined;
}, {
    bio: string | string[];
    lore: string[];
    name: string;
    modelProvider: ModelProviderName;
    topics: string[];
    messageExamples: {
        user: string;
        content: {
            text: string;
            action?: string | undefined;
            source?: string | undefined;
            url?: string | undefined;
            inReplyTo?: string | undefined;
            attachments?: any[] | undefined;
        } & Record<string, unknown>;
    }[][];
    postExamples: string[];
    adjectives: string[];
    plugins: string[] | {
        name: string;
        description: string;
        actions?: any[] | undefined;
        providers?: any[] | undefined;
        evaluators?: any[] | undefined;
        services?: any[] | undefined;
        clients?: any[] | undefined;
    }[];
    style: {
        all: string[];
        chat: string[];
        post: string[];
    };
    knowledge?: (string | {
        path: string;
        shared?: boolean | undefined;
    } | {
        directory: string;
        shared?: boolean | undefined;
    })[] | undefined;
    settings?: {
        model?: string | undefined;
        secrets?: Record<string, string> | undefined;
        voice?: {
            url?: string | undefined;
            model?: string | undefined;
        } | undefined;
        modelConfig?: {
            maxInputTokens?: number | undefined;
            maxOutputTokens?: number | undefined;
            frequency_penalty?: number | undefined;
            presence_penalty?: number | undefined;
            temperature?: number | undefined;
        } | undefined;
        embeddingModel?: string | undefined;
    } | undefined;
    id?: string | undefined;
    system?: string | undefined;
    modelEndpointOverride?: string | undefined;
    templates?: Record<string, string> | undefined;
    clientConfig?: {
        discord?: {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
        } | undefined;
        telegram?: {
            shouldIgnoreBotMessages?: boolean | undefined;
            shouldIgnoreDirectMessages?: boolean | undefined;
            shouldRespondOnlyToMentions?: boolean | undefined;
            shouldOnlyJoinInAllowedGroups?: boolean | undefined;
            allowedGroupIds?: string[] | undefined;
            messageSimilarityThreshold?: number | undefined;
            isPartOfTeam?: boolean | undefined;
            teamAgentIds?: string[] | undefined;
            teamLeaderId?: string | undefined;
            teamMemberUsernames?: Record<string, string> | undefined;
            teamMemberInterestKeywords?: string[] | undefined;
            autoPost?: {
                enabled?: boolean | undefined;
                monitorTime?: number | undefined;
                inactivityThreshold?: number | undefined;
                mainChannelId?: string | undefined;
                pinnedMessagesGroups?: string[] | undefined;
                minTimeBetweenPosts?: number | undefined;
            } | undefined;
        } | undefined;
    } | undefined;
    twitterProfile?: {
        bio: string;
        username: string;
        screenName: string;
        nicknames?: string[] | undefined;
    } | undefined;
    nft?: {
        prompt?: string | undefined;
    } | undefined;
    extends?: string[] | undefined;
}>;
export type CharacterConfig = z.infer<typeof CharacterSchema>;
export declare function validateCharacterConfig(json: unknown): CharacterConfig;
//# sourceMappingURL=environment.d.ts.map