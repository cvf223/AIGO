import type { Message } from "@telegraf/types";
import type { Context, Telegraf } from "telegraf";
import {
    composeContext,
    elizaLogger,
    ServiceType,
    composeRandomUser,
    UUID,
    stringToUuid,
} from "@elizaos/core";
import { getEmbeddingZeroVector } from "@elizaos/core";
import {
    type Content,
    type HandlerCallback,
    type IAgentRuntime,
    type IImageDescriptionService,
    type Memory,
    ModelClass,
    type State,
    type Media,
} from "@elizaos/core";
import { generateMessageResponse, generateShouldRespond } from "@elizaos/core";
import {
    telegramMessageHandlerTemplate,
    telegramShouldRespondTemplate,
    telegramAutoPostTemplate,
    telegramPinnedMessageTemplate,
} from "./templates";
import { cosineSimilarity, escapeMarkdown } from "./utils";
import {
    MESSAGE_CONSTANTS,
    TIMING_CONSTANTS,
    RESPONSE_CHANCES,
    TEAM_COORDINATION,
} from "./constants";

import fs from "fs";
import fsPromises from 'fs/promises';

enum MediaType {
    PHOTO = "photo",
    VIDEO = "video",
    DOCUMENT = "document",
    AUDIO = "audio",
    ANIMATION = "animation",
}

const MAX_MESSAGE_LENGTH = 4096; // Telegram's max message length
const MEMORY_USAGE_FILE = './memoryUsage.json';

interface MessageContext {
    content: string;
    timestamp: number;
}

interface AutoPostConfig {
    enabled: boolean;
    monitorTime: number;
    inactivityThreshold: number; // milliseconds
    mainChannelId: string;
    pinnedMessagesGroups: string[]; // Instead of announcementChannelIds
    lastAutoPost?: number;
    minTimeBetweenPosts?: number;
}

export type InterestChats = {
    [key: string]: {
        currentHandler: string | undefined;
        lastMessageSent: number;
        messages: { userId: UUID; userName: string; content: Content }[];
        previousContext?: MessageContext;
        contextSimilarityThreshold?: number;
    };
};

interface Attachment {
    type: 'photo' | 'document' | 'video' | 'audio' | 'voice' | 'sticker';
    fileId: string;
    url?: string;
    filename?: string;
    mimeType?: string;
    size?: number;
    width?: number;
    height?: number;
    duration?: number;
    title?: string;
    performer?: string;
    thumbnail?: {
        fileId: string;
        width: number;
        height: number;
        fileSize: number;
    };
}

interface TelegramMedia {
    type: 'photo' | 'document' | 'video' | 'audio' | 'voice' | 'sticker';
    file_id: string;
    url?: string;
    filename?: string;
    mime_type?: string;
    file_size?: number;
    width?: number;
    height?: number;
    duration?: number;
    title?: string;
    performer?: string;
    thumbnail?: {
        file_id: string;
        width: number;
        height: number;
        file_size: number;
    };
}

interface TelegramClientConfig {
    shouldIgnoreBotMessages?: boolean;
    shouldIgnoreDirectMessages?: boolean;
    shouldRespondOnlyToMentions?: boolean;
    shouldOnlyJoinInAllowedGroups?: boolean;
    allowedGroupIds?: string[];
    messageSimilarityThreshold?: number;
    isPartOfTeam?: boolean;
    teamAgentIds?: string[];
    teamLeaderId?: string;
    teamMemberUsernames?: { [key: string]: string };
    teamMemberInterestKeywords?: string[];
    autoPost?: {
        enabled?: boolean;
        monitorTime?: number;
        inactivityThreshold?: number;
        mainChannelId?: string;
        pinnedMessagesGroups?: string[];
        minTimeBetweenPosts?: number;
    };
}

interface DocumentMessage extends Omit<Message.DocumentMessage, 'document'> {
    document: {
        file_id: string;
        file_unique_id: string;
        file_name?: string;
        mime_type?: string;
    };
}

interface TelegramFile {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    file_path?: string;
}

export class MessageManager {
    public bot: Telegraf<Context>;
    private runtime: IAgentRuntime;
    private interestChats: InterestChats = {};
    private teamMemberUsernames: Map<string, string> = new Map();
    private autoPostConfig: AutoPostConfig;
    private lastChannelActivity: { [channelId: string]: number } = {};
    private autoPostInterval: NodeJS.Timeout;

    constructor(bot: Telegraf<Context>, runtime: IAgentRuntime) {
        this.bot = bot;
        this.runtime = runtime;

        this._initializeTeamMemberUsernames().catch((error) =>
            elizaLogger.error(
                "Error initializing team member usernames:",
                error
            )
        );

        this.autoPostConfig = {
            enabled:
                this.runtime.character.clientConfig?.telegram?.autoPost
                    ?.enabled || false,
            monitorTime:
                this.runtime.character.clientConfig?.telegram?.autoPost
                    ?.monitorTime || 300000,
            inactivityThreshold:
                this.runtime.character.clientConfig?.telegram?.autoPost
                    ?.inactivityThreshold || 3600000,
            mainChannelId:
                this.runtime.character.clientConfig?.telegram?.autoPost
                    ?.mainChannelId,
            pinnedMessagesGroups:
                this.runtime.character.clientConfig?.telegram?.autoPost
                    ?.pinnedMessagesGroups || [],
            minTimeBetweenPosts:
                this.runtime.character.clientConfig?.telegram?.autoPost
                    ?.minTimeBetweenPosts || 7200000,
        };

        if (this.autoPostConfig.enabled) {
            this._startAutoPostMonitoring();
        }

        // --- Persistent Usage Tracking: Load on startup ---
        if (!globalThis.__memoryUsageLoaded) {
            globalThis.__memoryUsageLoaded = true;
            (async () => {
                try {
                    const data = await fsPromises.readFile(MEMORY_USAGE_FILE, 'utf-8');
                    globalThis.__memoryUsage = JSON.parse(data);
                } catch (e) {
                    globalThis.__memoryUsage = {};
                }
            })();
        }
    }

    private _startAutoPostMonitoring(): void {
        // Wait for bot to be ready
        if (this.bot.botInfo) {
            elizaLogger.info(
                "[AutoPost Telegram] Bot ready, starting monitoring"
            );
            this._initializeAutoPost();
        } else {
            elizaLogger.info(
                "[AutoPost Telegram] Bot not ready, waiting for ready event"
            );
            this.bot.telegram.getMe().then(() => {
                elizaLogger.info(
                    "[AutoPost Telegram] Bot ready, starting monitoring"
                );
                this._initializeAutoPost();
            });
        }
    }

    private _initializeAutoPost(): void {
        // Give the bot a moment to fully initialize
        setTimeout(() => {
            // Monitor with random intervals between 2-6 hours
            // Monitor with random intervals between 2-6 hours
            this.autoPostInterval = setInterval(() => {
                this._checkChannelActivity();
            }, Math.floor(Math.random() * (4 * 60 * 60 * 1000) + 2 * 60 * 60 * 1000));
        }, 5000);
    }

    private async _checkChannelActivity(): Promise<void> {
        if (!this.autoPostConfig.enabled || !this.autoPostConfig.mainChannelId)
            return;

        try {
            // Get last message time
            const now = Date.now();
            const lastActivityTime =
                this.lastChannelActivity[this.autoPostConfig.mainChannelId] ||
                0;
            const timeSinceLastMessage = now - lastActivityTime;
            const timeSinceLastAutoPost =
                now - (this.autoPostConfig.lastAutoPost || 0);

            // Add some randomness to the inactivity threshold (±30 minutes)
            const randomThreshold =
                this.autoPostConfig.inactivityThreshold +
                (Math.random() * 1800000 - 900000);

            // Check if we should post
            if (
                timeSinceLastMessage > randomThreshold &&
                timeSinceLastAutoPost >
                    (this.autoPostConfig.minTimeBetweenPosts || 0)
            ) {
                try {
                    const roomId = stringToUuid(
                        this.autoPostConfig.mainChannelId +
                            "-" +
                            this.runtime.agentId
                    );
                    const memory = {
                        id: stringToUuid(`autopost-${Date.now()}`),
                        userId: this.runtime.agentId,
                        agentId: this.runtime.agentId,
                        roomId,
                        content: {
                            text: "AUTO_POST_ENGAGEMENT",
                            source: "telegram",
                        },
                        embedding: getEmbeddingZeroVector(),
                        createdAt: Date.now(),
                    };

                    let state = await this.runtime.composeState(memory, {
                        telegramBot: this.bot,
                        agentName: this.runtime.character.name,
                    });

                    const context = composeContext({
                        state,
                        template:
                            this.runtime.character.templates
                                ?.telegramAutoPostTemplate ||
                            telegramAutoPostTemplate,
                    });

                    const responseContent = await this._generateResponse(
                        memory,
                        state,
                        context
                    );
                    if (!responseContent?.text) return;

                    console.log(
                        `[Auto Post Telegram] Recent Messages: ${responseContent}`
                    );

                    // Send message directly using telegram bot
                    const messages = await Promise.all(
                        this.splitMessage(responseContent.text.trim()).map(
                            (chunk) =>
                                this.bot.telegram.sendMessage(
                                    this.autoPostConfig.mainChannelId,
                                    chunk
                                )
                        )
                    );

                    // Create and store memories
                    const memories = messages.map((m) => ({
                        id: stringToUuid(
                            roomId + "-" + m.message_id.toString()
                        ),
                        userId: this.runtime.agentId,
                        agentId: this.runtime.agentId,
                        content: {
                            ...responseContent,
                            text: m.text,
                        },
                        roomId,
                        embedding: getEmbeddingZeroVector(),
                        createdAt: m.date * 1000,
                    }));

                    for (const m of memories) {
                        await this.runtime.messageManager.createMemory(m);
                    }

                    this.autoPostConfig.lastAutoPost = Date.now();
                    state = await this.runtime.updateRecentMessageState(state);
                    await this.runtime.evaluate(memory, state, true);
                } catch (error) {
                    elizaLogger.warn("[AutoPost Telegram] Error:", error);
                }
            } else {
                elizaLogger.warn(
                    "[AutoPost Telegram] Activity within threshold. Not posting."
                );
            }
        } catch (error) {
            elizaLogger.warn(
                "[AutoPost Telegram] Error checking channel activity:",
                error
            );
        }
    }

    private async _monitorPinnedMessages(ctx: Context): Promise<void> {
        if (!this.autoPostConfig.pinnedMessagesGroups.length) {
            elizaLogger.warn(
                "[AutoPost Telegram] Auto post config no pinned message groups"
            );
            return;
        }

        if (!ctx.message || !("pinned_message" in ctx.message)) {
            return;
        }

        const pinnedMessage = ctx.message.pinned_message;
        if (!pinnedMessage) return;

        if (
            !this.autoPostConfig.pinnedMessagesGroups.includes(
                ctx.chat.id.toString()
            )
        )
            return;

        const mainChannel = this.autoPostConfig.mainChannelId;
        if (!mainChannel) return;

        try {
            elizaLogger.info(
                `[AutoPost Telegram] Processing pinned message in group ${ctx.chat.id}`
            );

            // Explicitly type and handle message content
            const messageContent: string =
                "text" in pinnedMessage &&
                typeof pinnedMessage.text === "string"
                    ? pinnedMessage.text
                    : "caption" in pinnedMessage &&
                      typeof pinnedMessage.caption === "string"
                    ? pinnedMessage.caption
                    : "New pinned message";

            const roomId = stringToUuid(
                mainChannel + "-" + this.runtime.agentId
            );
            const memory = {
                id: stringToUuid(`pinned-${Date.now()}`),
                userId: this.runtime.agentId,
                agentId: this.runtime.agentId,
                roomId,
                content: {
                    text: messageContent,
                    source: "telegram",
                    metadata: {
                        messageId: pinnedMessage.message_id,
                        pinnedMessageData: pinnedMessage,
                    },
                },
                embedding: getEmbeddingZeroVector(),
                createdAt: Date.now(),
            };

            let state = await this.runtime.composeState(memory, {
                telegramBot: this.bot,
                pinnedMessageContent: messageContent,
                pinnedGroupId: ctx.chat.id.toString(),
                agentName: this.runtime.character.name,
            });

            const context = composeContext({
                state,
                template:
                    this.runtime.character.templates
                        ?.telegramPinnedMessageTemplate ||
                    telegramPinnedMessageTemplate,
            });

            const responseContent = await this._generateResponse(
                memory,
                state,
                context
            );
            if (!responseContent?.text) return;

            // Send message using telegram bot
            const messages = await Promise.all(
                this.splitMessage(responseContent.text.trim()).map((chunk) =>
                    this.bot.telegram.sendMessage(mainChannel, chunk)
                )
            );

            const memories = messages.map((m) => ({
                id: stringToUuid(roomId + "-" + m.message_id.toString()),
                userId: this.runtime.agentId,
                agentId: this.runtime.agentId,
                content: {
                    ...responseContent,
                    text: m.text,
                },
                roomId,
                embedding: getEmbeddingZeroVector(),
                createdAt: m.date * 1000,
            }));

            for (const m of memories) {
                await this.runtime.messageManager.createMemory(m);
            }

            state = await this.runtime.updateRecentMessageState(state);
            await this.runtime.evaluate(memory, state, true);
        } catch (error) {
            elizaLogger.warn(
                `[AutoPost Telegram] Error processing pinned message:`,
                error
            );
        }
    }

    private _getTeamMemberUsername(id: string): string | undefined {
        return this.teamMemberUsernames.get(id);
    }

    private _getNormalizedUserId(id: string | number): string {
        return id.toString().replace(/[^0-9]/g, "");
    }

    private _isTeamMember(userId: string | number): boolean {
        const teamConfig = this.runtime.character.clientConfig?.telegram;
        if (!teamConfig?.isPartOfTeam || !teamConfig.teamAgentIds) return false;

        const normalizedUserId = this._getNormalizedUserId(userId);
        return teamConfig.teamAgentIds.some(
            (teamId) => this._getNormalizedUserId(teamId) === normalizedUserId
        );
    }

    private _isTeamLeader(): boolean {
        return (
            this.bot.botInfo?.id.toString() ===
            this.runtime.character.clientConfig?.telegram?.teamLeaderId
        );
    }

    private _isTeamCoordinationRequest(content: string): boolean {
        const contentLower = content.toLowerCase();
        return TEAM_COORDINATION.KEYWORDS?.some((keyword) =>
            contentLower.includes(keyword.toLowerCase())
        );
    }

    private _isRelevantToTeamMember(
        content: string,
        chatId: string,
        lastAgentMemory: Memory | null = null
    ): boolean {
        const teamConfig = this.runtime.character.clientConfig?.telegram;

        // Check leader's context based on last message
        if (this._isTeamLeader() && lastAgentMemory?.content.text) {
            const timeSinceLastMessage = Date.now() - lastAgentMemory.createdAt;
            if (timeSinceLastMessage > MESSAGE_CONSTANTS.INTEREST_DECAY_TIME) {
                return false;
            }

            const similarity = cosineSimilarity(
                content.toLowerCase(),
                lastAgentMemory.content.text.toLowerCase()
            );

            return (
                similarity >=
                MESSAGE_CONSTANTS.DEFAULT_SIMILARITY_THRESHOLD_FOLLOW_UPS
            );
        }

        // Check team member keywords
        if (!teamConfig?.teamMemberInterestKeywords?.length) {
            return false; // If no keywords defined, only leader maintains conversation
        }

        // Check if content matches any team member keywords
        return teamConfig.teamMemberInterestKeywords.some((keyword) =>
            content.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    private async _analyzeContextSimilarity(
        currentMessage: string,
        previousContext?: MessageContext,
        agentLastMessage?: string
    ): Promise<number> {
        if (!previousContext) return 1;

        const timeDiff = Date.now() - previousContext.timestamp;
        const timeWeight = Math.max(0, 1 - timeDiff / (5 * 60 * 1000));

        const similarity = cosineSimilarity(
            currentMessage.toLowerCase(),
            previousContext.content.toLowerCase(),
            agentLastMessage?.toLowerCase()
        );

        return similarity * timeWeight;
    }

    private _getMentionedUsernames(messageText: string): string[] {
        if (!messageText) return [];
        
        // Extract all mentions in the format @username
        const mentionRegex = /@(\w+)/g;
        const matches = messageText.match(mentionRegex) || [];
        
        // Clean up the usernames (remove the @ symbol)
        return matches.map(match => match.substring(1));
    }

    private async _shouldRespond(message: Message, state: State): Promise<boolean> {
        // Use proper type checking instead of direct property access
        const messageText = 'text' in message ? message.text : 
                            'caption' in message ? message.caption : "";
        
        // Skip messages with no text content
        if (!messageText) {
            elizaLogger.debug("Skipping message with no text content");
            return false;
        }

        // Handle different chat types
        if (message.chat.type === "private") {
            elizaLogger.debug("Always responding to private chat messages");
            return true;
        }

        // Check for bot mention or reply
        const botInfo = this.bot.botInfo;
        if (!botInfo) {
            elizaLogger.warn("Bot info not available, can't check for mentions");
            return false;
        }

        // Check if this is a direct mention of the bot
        const botUsername = botInfo.username;
        const isMentioned = botUsername && messageText.includes(`@${botUsername}`);
        
        // Check if this is a reply to a message from this bot
        const isReplyToBot = 'reply_to_message' in message && 
                             message.reply_to_message && 
                             message.reply_to_message.from && 
                             message.reply_to_message.from.id === botInfo.id;
        
        // Check if message is from another bot (for inter-bot communication)
        const isFromBot = message.from && message.from.is_bot;
        
        // Special case: automatically respond to messages from other bots in our agent system
        // This is the key fix for bot-to-bot communication
        if (isFromBot) {
            // Get the team config to check if this bot is on our team
            const teamConfig = this.runtime.character.clientConfig?.telegram;
            
            if (teamConfig?.isPartOfTeam && message.from && message.from.id) {
                // Check if sender is in our team
                const senderId = message.from.id.toString();
                const isTeamMember = teamConfig.teamAgentIds?.some(id => 
                    id.toString().replace(/[^0-9]/g, "") === senderId.replace(/[^0-9]/g, "")
                );
                
                if (isTeamMember) {
                    // Special commands or knowledge requests should always get a response
                    if (messageText.startsWith('/') || 
                        messageText.includes('Knowledge Request:') ||
                        messageText.includes('Team Update:')) {
                        elizaLogger.debug(`Responding to team bot command: ${messageText.substring(0, 20)}...`);
                        return true;
                    }
                    
                    // Direct mentions of this bot should always get a response
                    const botName = this.runtime.character.name;
                    if ((botUsername && messageText.includes(`@${botUsername}`)) || 
                        (botName && messageText.toLowerCase().includes(botName.toLowerCase()))) {
                        elizaLogger.debug(`Bot explicitly mentioned by team member, will respond`);
        return true;
                    }
                    
                    // Also respond to agents talking about our specialty
                    const specialties = this.runtime.character.specialties || [];
                    for (const specialty of specialties) {
                        if (messageText.toLowerCase().includes(specialty.toLowerCase())) {
                            elizaLogger.debug(`Message from team bot contains specialty: ${specialty}`);
                            return true;
                        }
                    }
                    
                    // Add random chance to join conversation
                    if (Math.random() < 0.15) { // 15% chance to respond
                        elizaLogger.debug("Randomly joining team conversation");
                        return true;
                    }
                }
            }
        }
        
        // For non-bot messages, only respond if it's for us
        return isMentioned || isReplyToBot;
    }

    private _isMessageForMe(message: Message): boolean {
        const botUsername = this.bot.botInfo?.username;
        if (!botUsername) return false;

        const messageText =
            "text" in message
                ? message.text
                : "caption" in message
                ? message.caption
                : "";
        if (!messageText) return false;

        const isReplyToBot =
            (message as any).reply_to_message?.from?.is_bot === true &&
            (message as any).reply_to_message?.from?.username === botUsername;
        const isMentioned = messageText.includes(`@${botUsername}`);
        const hasUsername = messageText
            .toLowerCase()
            .includes(botUsername.toLowerCase());

        return (
            isReplyToBot ||
            isMentioned ||
            (!this.runtime.character.clientConfig?.telegram
                ?.shouldRespondOnlyToMentions &&
                hasUsername)
        );
    }

    private _checkInterest(chatId: string): boolean {
        const chatState = this.interestChats[chatId];
        if (!chatState) return false;

        const lastMessage = chatState.messages[chatState.messages.length - 1];
        const timeSinceLastMessage = Date.now() - chatState.lastMessageSent;

        if (timeSinceLastMessage > MESSAGE_CONSTANTS.INTEREST_DECAY_TIME) {
            delete this.interestChats[chatId];
            return false;
        } else if (
            timeSinceLastMessage > MESSAGE_CONSTANTS.PARTIAL_INTEREST_DECAY
        ) {
            return this._isRelevantToTeamMember(
                lastMessage?.content.text || "",
                chatId
            );
        }

        // Team leader specific checks
        if (this._isTeamLeader() && chatState.messages.length > 0) {
            if (
                !this._isRelevantToTeamMember(
                    lastMessage?.content.text || "",
                    chatId
                )
            ) {
                const recentTeamResponses = chatState.messages
                    .slice(-3)
                    .some(
                        (m) =>
                            m.userId !== this.runtime.agentId &&
                            this._isTeamMember(m.userId.toString())
                    );

                if (recentTeamResponses) {
                    delete this.interestChats[chatId];
                    return false;
                }
            }
        }

        return true;
    }

    // Process image messages and generate descriptions
    private async processImage(
        message: Message
    ): Promise<{ description: string } | null> {
        try {
            let imageUrl: string | null = null;

            elizaLogger.info(`Telegram Message: ${message}`);

            if ("photo" in message && message.photo?.length > 0) {
                const photo = message.photo[message.photo.length - 1];
                const fileLink = await this.bot.telegram.getFileLink(
                    photo.file_id
                );
                imageUrl = fileLink.toString();
            } else if (
                "document" in message &&
                message.document?.mime_type?.startsWith("image/")
            ) {
                const fileLink = await this.bot.telegram.getFileLink(
                    message.document.file_id
                );
                imageUrl = fileLink.toString();
            }

            if (imageUrl) {
                const imageDescriptionService =
                    this.runtime.getService<IImageDescriptionService>(
                        ServiceType.IMAGE_DESCRIPTION
                    );
                const { title, description } =
                    await imageDescriptionService.describeImage(imageUrl);
                return { description: `[Image: ${title}\n${description}]` };
            }
        } catch (error) {
            console.error("❌ Error processing image:", error);
        }

        return null;
    }

    private splitMessage(text: string): string[] {
        const chunks: string[] = [];
        let currentChunk = "";

        const lines = text.split("\n");
        for (const line of lines) {
            if (currentChunk.length + line.length + 1 <= MAX_MESSAGE_LENGTH) {
                currentChunk += (currentChunk ? "\n" : "") + line;
            } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = line;
            }
        }

        if (currentChunk) chunks.push(currentChunk);
        return chunks;
    }

    private convertMediaToAttachment(media: TelegramMedia): Attachment {
        return {
            type: media.type,
            fileId: media.file_id,
            url: media.url,
            filename: media.filename,
            mimeType: media.mime_type,
            size: media.file_size,
            width: media.width,
            height: media.height,
            duration: media.duration,
            title: media.title,
            performer: media.performer,
            thumbnail: media.thumbnail ? {
                fileId: media.thumbnail.file_id,
                width: media.thumbnail.width,
                height: media.thumbnail.height,
                fileSize: media.thumbnail.file_size
            } : undefined
        };
    }

    private convertCoreMediaToAttachment(media: Media): Attachment {
        return {
            type: 'document', // Default to document type for core Media
            fileId: media.id,
            url: media.url,
            filename: media.title || 'document',
            mimeType: media.contentType || 'application/octet-stream',
            title: media.title
        };
    }

    private async sendMessageInChunks(
        ctx: Context,
        message: string,
        attachments: Attachment[] = []
    ): Promise<Message.TextMessage[]> {
        try {
            const sentMessages: Message.TextMessage[] = [];
            
            // Handle attachments first if any
            if (attachments.length > 0) {
                for (const attachment of attachments) {
                    if (attachment.type === "photo") {
                        const sentMessage = await ctx.replyWithPhoto(attachment.fileId, {
                            caption: message,
                            parse_mode: "HTML",
                        });
                        // Store the message ID for reference
                        sentMessages.push({
                            message_id: sentMessage.message_id,
                            date: sentMessage.date,
                            chat: sentMessage.chat,
                            text: message
                        } as Message.TextMessage);
                    } else if (attachment.type === "document") {
                        const sentMessage = await ctx.replyWithDocument(attachment.fileId, {
                            caption: message,
                            parse_mode: "HTML",
                        });
                        // Store the message ID for reference
                        sentMessages.push({
                            message_id: sentMessage.message_id,
                            date: sentMessage.date,
                            chat: sentMessage.chat,
                            text: message
                        } as Message.TextMessage);
                    }
                }
            } else {
                // Split message into chunks if it's too long
                const chunks = this.splitMessage(message);
                for (let i = 0; i < chunks.length; i++) {
                    const sentMessage = await ctx.reply(chunks[i], {
                        parse_mode: "HTML",
                        reply_parameters: ctx.message?.message_id ? { message_id: ctx.message.message_id } : undefined,
                    });
                    sentMessages.push(sentMessage);
                }
            }
            
            return sentMessages;
        } catch (error) {
            elizaLogger.error("Error sending message chunks:", error);
            throw error;
        }
    }

    private async handleMediaMessage(ctx: Context, media: TelegramMedia[]): Promise<void> {
        const attachments = media.map(m => this.convertMediaToAttachment(m));
        await this.sendMessageInChunks(ctx, "", attachments);
    }

    private async handleCoreMediaMessage(ctx: Context, media: Media[]): Promise<void> {
        const attachments: Attachment[] = media.map(m => this.convertCoreMediaToAttachment(m));
        await this.sendMessageInChunks(ctx, "", attachments);
    }

    private async handleTextMessage(ctx: Context, text: string): Promise<void> {
        await this.sendMessageInChunks(ctx, text, []);
    }

    private async handleCoreMessage(ctx: Context, message: Message): Promise<void> {
        if ('text' in message) {
            await this.handleTextMessage(ctx, message.text);
        }
        if ('media' in message && Array.isArray(message.media) && message.media.length > 0) {
            await this.handleCoreMediaMessage(ctx, message.media as Media[]);
        }
    }

    private async _generateResponse(
        message: Memory,
        _state: State,
        context: string
    ): Promise<Content> {
        const { userId, roomId } = message;

        const response = await generateMessageResponse({
            runtime: this.runtime,
            context,
            modelClass: ModelClass.LARGE,
        });

        if (!response) {
            console.error("❌ No response from generateMessageResponse");
            return null;
        }

        await this.runtime.databaseAdapter.log({
            body: { message, context, response },
            userId,
            roomId,
            type: "response",
        });

        await this.runtime.messageManager.createMemory({
            id: stringToUuid(Date.now().toString() + '-' + Math.random().toString()),
            agentId: this.runtime.agentId,
            roomId: stringToUuid(roomId.toString()),
            userId,
            content: response,
            createdAt: Date.now(),
        });

        return response;
    }

    // Main handler for incoming messages
    public async handleMessage(ctx: Context): Promise<void> {
        try {
            const message = ctx.message;
            if (!message) return;

            let messageContent = "";
            if ("text" in message) {
                messageContent = message.text;
            } else if ("caption" in message) {
                messageContent = message.caption || "";
            }

            // Process images if present
            if ("photo" in message || ("document" in message && message.document?.mime_type?.startsWith("image/"))) {
                const imageDescription = await this.processImage(message);
                if (imageDescription) {
                    messageContent += "\n" + imageDescription.description;
                }
            }

            // Skip if the message is empty after processing
            if (!messageContent) {
                elizaLogger.debug("Empty message content after processing, skipping");
                return;
            }

            // Check if this is a message we should respond to
            // Create a proper state object with all required properties
            const roomId = stringToUuid(message.chat.id.toString() + "-" + this.runtime.agentId);
            const state: State = {
                telegramBot: this.bot,
                agentName: this.runtime.character.name,
                bio: Array.isArray(this.runtime.character.bio) ? this.runtime.character.bio.join("\n") : this.runtime.character.bio || "",
                lore: Array.isArray(this.runtime.character.lore) ? this.runtime.character.lore.join("\n") : this.runtime.character.lore || "",
                messageDirections: "",
                postDirections: "",
                recentMessages: messageContent,
                messageContent,
                chatId: message.chat.id.toString(),
                userId: stringToUuid(message.from?.id.toString() || "unknown"),
                username: message.from?.username || "unknown",
                character: this.runtime.character,
                runtime: this.runtime,
                roomId,
                actors: "",
                recentMessagesData: []
            };

            try {
            const shouldRespond = await this._shouldRespond(message, state);
            if (!shouldRespond) {
                    elizaLogger.debug("Decided not to respond to message");
                return;
            }
            } catch (shouldRespondError) {
                // Log error but continue with default behavior for responding
                elizaLogger.error("Error in _shouldRespond, continuing with default behavior:", shouldRespondError);
                
                // For bot messages, default to not responding if there's an error
                if (message.from?.is_bot) {
                    elizaLogger.debug("Default behavior for bot message with error: not responding");
                        return;
                }
            }

            // Perform error-resistant message processing
            try {
                // Check if this is a special message type like pinned message notification
                if ("chat" in message && 
                    // Fixed type comparison to check if it's a channel-type message
                    ("type" in message.chat && message.chat.type.toString() === "channel")) {
            await this._monitorPinnedMessages(ctx);
                    return;
                }

                // Create a new memory for this message
                const memory: Memory = {
                        agentId: this.runtime.agentId,
                    roomId: stringToUuid(`${message.chat.id}-${this.runtime.agentId}`),
                    userId: message.from?.id
                        ? stringToUuid(message.from.id.toString())
                        : stringToUuid("anonymous"),
                            createdAt: Date.now(),
                    id: stringToUuid(message.message_id.toString()),
                    content: {
                        text: messageContent,
                    },
                };

                // Handle media messages specially
                if ("photo" in message || "video" in message || "document" in message) {
                    const media = [];
                    if ("photo" in message && message.photo?.length) {
                        const largestPhoto = message.photo[message.photo.length - 1];
                        media.push({
                            type: "photo",
                            file_id: largestPhoto.file_id,
                        });
                    } else if ("video" in message) {
                        media.push({
                            type: "video",
                            file_id: message.video.file_id,
                        });
                    } else if ("document" in message) {
                        media.push({
                            type: "document",
                            file_id: message.document.file_id,
                            filename: message.document.file_name,
                            mime_type: message.document.mime_type,
                        });
                    }

                    await this.handleMediaMessage(ctx, media);
                }

                // Generate and send response based on the memory
                // First, store the memory if needed
                // Use type guards to check properties
                if (!("text" in ctx.message && ctx.message.text === "/nolog") && 
                    !("caption" in ctx.message && ctx.message.caption === "/nolog")) {
                    try {
                        await this.runtime.messageManager.createMemory(memory);
                    } catch (createMemoryError) {
                        // Log but continue even if memory creation fails
                        elizaLogger.error("Failed to create memory:", createMemoryError);
                    }
                                    } else {
                    elizaLogger.info("Skipping memory creation due to /nolog command");
                }

                // Process reply-to if present
                let context = "";
                if ("reply_to_message" in message && message.reply_to_message) {
                    if ("text" in message.reply_to_message) {
                        context = message.reply_to_message.text || "";
                    } else if ("caption" in message.reply_to_message) {
                        context = message.reply_to_message.caption || "";
                    }
                }

                // Generate and send the response
                const response = await this._generateResponse(memory, state, context);
                if (response && response.text && response.text.trim()) {
                    try {
                        // Convert Media[] to Attachment[] if needed
                        const attachments: Attachment[] = response.attachments ? 
                            response.attachments.map(m => ({
                                type: 'document',
                                fileId: m.id || m.url || '',
                                url: m.url,
                                filename: m.title || 'file',
                                mimeType: m.contentType || 'application/octet-stream'
                            })) : [];
                            
                        // Split and send the message in chunks to handle large messages
                        const messagesWithAttachments = await this.sendMessageInChunks(
                            ctx,
                            response.text.trim(),
                            attachments
                        );
                        elizaLogger.debug("Successfully sent response");
                    } catch (sendError) {
                        elizaLogger.error("Error sending message:", sendError);
                        
                        // Try a simpler message if the full response failed
                        if (!ctx.from?.is_bot) {
                            try {
                                await ctx.reply("I processed your message but had difficulty sending my full response. Please try again in a moment.");
                            } catch (replyError) {
                                elizaLogger.error("Failed to send simplified error message:", replyError);
                            }
                        }
                    }
                    } else {
                    elizaLogger.debug("Empty response, not sending message");
                }
            } catch (processingError) {
                // Log processing error but don't crash
                elizaLogger.error("Error processing message:", processingError);
                
                // Only send error messages to humans, not bots
                if (!message.from?.is_bot) {
                    try {
                        await ctx.reply("I encountered an issue processing your message. Please try again or rephrase your request.");
                    } catch (replyError) {
                        elizaLogger.error("Failed to send error message:", replyError);
                    }
                }
            }
        } catch (error) {
            // Handle any unhandled errors in the whole process
            elizaLogger.error("Error handling message:", error);
            const errorDetails = error.stack || error.message || JSON.stringify(error);
            elizaLogger.debug(`Detailed error: ${errorDetails}`);
            
            // Don't show error messages to other bots
            if (!ctx.message?.from?.is_bot) {
                try {
                    await ctx.reply("I'm having difficulty processing this message. Please try again or phrase your request differently.");
                } catch (replyError) {
                    elizaLogger.error("Failed to send error message:", replyError);
                }
                } else {
                // Just log bot-to-bot errors but don't display any message
                elizaLogger.warn("Suppressed error message for bot-to-bot communication");
            }
        }
    }

    private async _initializeTeamMemberUsernames(): Promise<void> {
        const config = this.runtime.character.clientConfig?.telegram as TelegramClientConfig;
        if (!config?.isPartOfTeam) return;

        const teamAgentIds = config.teamAgentIds || [];
        const teamMemberUsernames = config.teamMemberUsernames || {};

        // Clear existing usernames
        this.teamMemberUsernames.clear();

        // Cache usernames directly from config without verification
        for (const id of teamAgentIds) {
            const username = teamMemberUsernames[id];
            if (username) {
                // Store username directly without triggering Telegraf's getChat
                this.teamMemberUsernames.set(id.toString(), username);
                elizaLogger.info(`Cached username for team member ${id}: ${username}`);
                } else {
                elizaLogger.warn(`No username configured for team member ${id}`);
            }
        }
    }

    // Helper method to validate usage data structure
    private _validateUsageData(data: any): boolean {
        if (typeof data !== 'object' || data === null) return false;
        
        // Check if all values are numbers
        return Object.entries(data).every(([key, value]) => {
            return typeof key === 'string' && typeof value === 'number' && !isNaN(value);
        });
    }

    // Helper method to generate usage analytics
    private _generateUsageAnalytics(usageData: Record<string, number>): { 
        summary: string;
        chartData?: Buffer;
    } {
        const entries = Object.entries(usageData);
        const totalMemories = entries.length;
        const totalUsage = entries.reduce((sum, [_, count]) => sum + count, 0);
        const avgUsage = totalMemories > 0 ? totalUsage / totalMemories : 0;
        
        // Sort by usage count
        entries.sort(([, a], [, b]) => b - a);
        
        const top5 = entries.slice(0, 5);
        const bottom5 = entries.filter(([_, v]) => v > 0).slice(-5);
        
        // Calculate usage distribution
        const unusedCount = entries.filter(([_, v]) => v === 0).length;
        const lowUsageCount = entries.filter(([_, v]) => v > 0 && v <= 5).length;
        const mediumUsageCount = entries.filter(([_, v]) => v > 5 && v <= 20).length;
        const highUsageCount = entries.filter(([_, v]) => v > 20).length;

        let summary = `📊 *Memory Usage Analytics*\n\n` +
            `Total Memories: ${totalMemories}\n` +
            `Total Usage Count: ${totalUsage}\n` +
            `Average Usage: ${avgUsage.toFixed(2)}\n\n` +
            `*Usage Distribution:*\n` +
            `• Never Used: ${unusedCount}\n` +
            `• Low Usage (1-5): ${lowUsageCount}\n` +
            `• Medium Usage (6-20): ${mediumUsageCount}\n` +
            `• High Usage (>20): ${highUsageCount}\n\n` +
            `*Top 5 Most Used:*\n` +
            top5.map(([id, count]) => `• ID: ${id.slice(0, 8)}... used ${count} times`).join('\n') +
            `\n\n*Bottom 5 Least Used (nonzero):*\n` +
            bottom5.map(([id, count]) => `• ID: ${id.slice(0, 8)}... used ${count} times`).join('\n');

        return { summary };
    }
}

function isHighPriorityKnowledgeBroadcast(message: any): boolean {
    // You can use a special prefix or structure to identify these messages
    return typeof message.text === "string" && message.text.startsWith("📢 *High-Priority Knowledge Shared!*");
}

async function evaluateFactRelevance(runtime: IAgentRuntime, fact: any): Promise<boolean> {
    // Example: Use the LLM or a simple keyword match to check if the fact relates to current tasks/goals
    const goals = await runtime.databaseAdapter.getGoals({
        agentId: runtime.agentId,
        roomId: fact.relatedTask ? fact.relatedTask : "", // or use the current room
        onlyInProgress: true,
        count: 10,
    });
    const currentTasks = goals.flatMap(g => [g.name, ...(g.objectives?.map(o => o.description) || [])]);
    // Simple check: does the fact.relatedTask match any current task?
    return currentTasks.some(task => fact.relatedTask && fact.relatedTask.includes(task));
}
