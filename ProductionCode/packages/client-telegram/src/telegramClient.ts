import { type Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { type IAgentRuntime, elizaLogger } from "@elizaos/core";
import { MessageManager } from "./messageManager.ts";
import { getOrCreateRecommenderInBe } from "./getOrCreateRecommenderInBe.ts";

export class TelegramClient {
    public bot: Telegraf<Context>;
    private runtime: IAgentRuntime;
    public messageManager: MessageManager;
    private backend;
    private backendToken;
    private tgTrader;
    private options;
    public botUsername: string;
    private webhookUrl: string;
    private webhookPort: number;
    private isLongPolling: boolean;
    private errorRetryCount: number = 0;
    private maxErrorRetries: number = 5;

    constructor(runtime: IAgentRuntime, botToken: string) {
        elizaLogger.log("📱 Constructing new TelegramClient...");
        this.options = {
            telegram: {
                apiRoot: runtime.getSetting("TELEGRAM_API_ROOT") || process.env.TELEGRAM_API_ROOT || "https://api.telegram.org"
            },
        };
        this.runtime = runtime;
        
        // Get webhook configuration
        this.webhookUrl = runtime.getSetting("TELEGRAM_WEBHOOK_URL") || process.env.TELEGRAM_WEBHOOK_URL;
        this.webhookPort = parseInt(runtime.getSetting("TELEGRAM_WEBHOOK_PORT") || process.env.TELEGRAM_WEBHOOK_PORT || "8443");
        
        // Create a new bot instance for each client
        this.bot = new Telegraf(botToken, this.options);
        
        this.messageManager = new MessageManager(this.bot, this.runtime);
        
        this.backend = runtime.getSetting("BACKEND_URL");
        this.backendToken = runtime.getSetting("BACKEND_TOKEN");
        this.tgTrader = runtime.getSetting("TG_TRADER");
        elizaLogger.log("✅ TelegramClient constructor completed");
    }

    async init(): Promise<void> {
        try {
            // Get bot info first
            const botInfo = await this.bot.telegram.getMe();
            this.botUsername = botInfo.username;
            
            // Set up webhook if URL is provided
            if (this.webhookUrl) {
                await this.bot.telegram.setWebhook(`${this.webhookUrl}/telegram-webhook/${this.botUsername}`, {
                    allowed_updates: ["message", "callback_query", "inline_query"]
                });
                elizaLogger.info(`Webhook set for bot ${this.botUsername} at ${this.webhookUrl}/telegram-webhook/${this.botUsername}`);
            } else {
                // Fallback to polling if no webhook URL is provided
                elizaLogger.warn("No webhook URL provided, falling back to polling mode");
                await this.bot.launch();
            }

            // Set up message handlers
            this.setupMessageHandlers();
            
            elizaLogger.info(`Telegram bot ${this.botUsername} initialized successfully`);
        } catch (error) {
            elizaLogger.error("Failed to initialize Telegram bot:", error);
            throw error;
        }
    }

    private async isGroupAuthorized(ctx: Context): Promise<boolean> {
        const config = this.runtime.character.clientConfig?.telegram;
        if (ctx.from?.id === ctx.botInfo?.id) {
            return false;
        }

        if (!config?.shouldOnlyJoinInAllowedGroups) {
            return true;
        }

        const allowedGroups = config.allowedGroupIds || [];
        const currentGroupId = ctx.chat.id.toString();

        if (!allowedGroups.includes(currentGroupId)) {
            elizaLogger.info(`Unauthorized group detected: ${currentGroupId}`);
            try {
                await ctx.reply("Not authorized. Leaving.");
                await ctx.leaveChat();
            } catch (error) {
                elizaLogger.error(
                    `Error leaving unauthorized group ${currentGroupId}:`,
                    error
                );
            }
            return false;
        }

        return true;
    }

    private async isMessageForThisBot(ctx: Context): Promise<boolean> {
        // Check if the message is a reply to this bot
        if ('reply_to_message' in ctx.message && 
            ctx.message.reply_to_message?.from?.username === this.botUsername) {
            return true;
        }

        // Check if the message mentions this bot
        if ('text' in ctx.message && 
            ctx.message.text?.includes(`@${this.botUsername}`)) {
            return true;
        }

        // Check if the message is a direct message to this bot
        if (ctx.chat.type === 'private') {
            return true;
        }

        return false;
    }

    private setupMessageHandlers(): void {
        elizaLogger.log("Setting up message handler...");

        this.bot.on(message("new_chat_members"), async (ctx) => {
            try {
                const newMembers = ctx.message.new_chat_members;
                const isBotAdded = newMembers.some(
                    (member) => member.id === ctx.botInfo.id
                );

                if (isBotAdded && !(await this.isGroupAuthorized(ctx))) {
                    return;
                }
            } catch (error) {
                elizaLogger.error("Error handling new chat members:", error);
            }
        });

        this.bot.on("message", async (ctx) => {
            try {
                // Check if message is meant for this bot
                if (!(await this.isMessageForThisBot(ctx))) {
                    return;
                }

                // Check group authorization
                if (!(await this.isGroupAuthorized(ctx))) {
                    return;
                }

                // --- 0.1% EXPERT: Write triggers for all relevant agents in the room ---
                // TODO: Replace with advanced filtering based on agent mindset, character, goals, and tasks
                const roomId = ctx.chat.id.toString();
                // Type guard for text property
                let text = '';
                if (typeof (ctx.message as any).text === 'string') {
                  text = (ctx.message as any).text;
                }
                const messageContent = {
                  text,
                  from: ctx.from?.username || ctx.from?.first_name || ctx.from?.id,
                  date: ctx.message.date,
                  message_id: ctx.message.message_id,
                  roomId,
                  raw: ctx.message
                };
                // Pseudo: get all agent IDs in the room (replace with real logic)
                let agentIds: string[] = [];
                if (typeof (this.runtime as any).getAgentsForRoom === 'function') {
                  agentIds = await (this.runtime as any).getAgentsForRoom(roomId);
                } else if (this.runtime.agentId) {
                  agentIds = [this.runtime.agentId];
                } else {
                  // TODO: fallback to a static agent list or config
                  agentIds = [];
                }
                // Use runtime require to avoid rootDir error in DTS build
                // @ts-ignore
                const { writeAgentTrigger } = require('../../../agent/src/watchAgentTrigger.js');
                for (const agentId of agentIds) {
                  // TODO: filter by agent mindset/character/goals/tasks
                  writeAgentTrigger(agentId, messageContent);
                }
                // --- END TRIGGER LOGIC ---

                if (this.tgTrader) {
                    const userId = ctx.from?.id.toString();
                    const username = ctx.from?.username || ctx.from?.first_name || "Unknown";
                    if (!userId) {
                        elizaLogger.warn("Received message from a user without an ID.");
                        return;
                    }
                    try {
                        await getOrCreateRecommenderInBe(
                            userId,
                            username,
                            this.backendToken,
                            this.backend
                        );
                    } catch (error) {
                        elizaLogger.error("Error getting or creating recommender in backend", error);
                    }
                }

                await this.messageManager.handleMessage(ctx);
            } catch (error) {
                elizaLogger.error("❌ Error handling message:", error);
                
                // Only send error messages for user messages, not bot messages
                if (!ctx.from?.is_bot && error?.response?.error_code !== 403) {
                    try {
                        await ctx.reply("I'm having difficulty processing your message. Please try again or rephrase your question.");
                    } catch (replyError) {
                        elizaLogger.error("Failed to send error message:", replyError);
                    }
                } else if (ctx.from?.is_bot) {
                    // For bot-to-bot communication, log the error but don't reply
                    // This prevents the "I encountered an issue" messages from breaking the flow
                    elizaLogger.warn("Error in bot-to-bot communication - skipping error reply:", error);
                    
                    // Try to continue by ignoring this message but not breaking the conversation
                    try {
                        // We can optionally notify the system admin, but we definitely shouldn't
                        // send a reply message to the other bot as that breaks the conversation flow
                    } catch (logError) {
                        elizaLogger.error("Failed to handle bot-to-bot error:", logError);
                    }
                }
            }
        });

        this.bot.on("photo", (ctx) => {
            elizaLogger.log(
                "📸 Received photo message with caption:",
                ctx.message.caption
            );
        });

        this.bot.on("document", (ctx) => {
            elizaLogger.log(
                "📎 Received document message:",
                ctx.message.document.file_name
            );
        });

        this.bot.catch((err, ctx) => {
            elizaLogger.error(`❌ Telegram Error for ${ctx.updateType}:`, err);
            ctx.reply("An unexpected error occurred. Please try again later.");
        });
    }

    async cleanup(): Promise<void> {
        try {
            if (this.webhookUrl) {
                await this.bot.telegram.deleteWebhook();
                elizaLogger.info(`Webhook removed for bot ${this.botUsername}`);
            } else {
                await this.bot.stop();
                elizaLogger.info(`Polling stopped for bot ${this.botUsername}`);
            }
        } catch (error) {
            elizaLogger.error("Error during bot cleanup:", error);
            throw error;
        }
    }

    public async stop(): Promise<void> {
        elizaLogger.log("Stopping Telegram bot...");
        await this.bot.stop();
        elizaLogger.log("Telegram bot stopped");
    }

    private handleBotError(error: any): void {
        this.errorRetryCount++;
        
        if (this.errorRetryCount > this.maxErrorRetries) {
            elizaLogger.error(`Too many Telegram bot errors (${this.errorRetryCount}), stopping retries`);
            return;
        }
        
        elizaLogger.log(`Telegram bot error #${this.errorRetryCount}, attempting recovery...`);
        
        // Try to restart after a delay if webhook isn't being used
        if (!this.webhookUrl) {
            setTimeout(() => {
                try {
                    elizaLogger.log('Restarting Telegram connection...');
                    // Use launch instead of the private startPolling method
                    this.bot.launch();
                } catch (restartError) {
                    elizaLogger.error('Failed to restart Telegram connection:', restartError);
                }
            }, 5000 * Math.min(this.errorRetryCount, 5)); // Increasing backoff up to 25 seconds
        }
    }
    
    private handlePollingError(error: any): void {
        // Handle specific Telegram API errors more gracefully
        if (error.code === 'ETELEGRAM') {
            // These are API errors from Telegram
            elizaLogger.warn(`Telegram API error: ${error.message}`);
            
            // Check for specific error cases
            if (error.message.includes('Too Many Requests')) {
                // Rate limiting - need to back off
                const retryAfter = error.parameters?.retry_after || 30;
                elizaLogger.log(`Rate limited by Telegram, backing off for ${retryAfter} seconds`);
                
                // Stop and restart after the suggested delay
                if (!this.webhookUrl) {
                    try {
                        // Stop the bot
                        this.bot.stop();
                        
                        // Schedule restart after delay
                        setTimeout(() => {
                            try {
                                this.bot.launch();
                                elizaLogger.info('Telegram bot restarted after rate limit backoff');
                            } catch (startError) {
                                elizaLogger.error('Failed to restart bot after backoff:', startError);
                            }
                        }, retryAfter * 1000 + 1000); // Add a small buffer
                    } catch (stopError) {
                        elizaLogger.error('Error stopping bot:', stopError);
                    }
                }
            }
        } else {
            // Handle network errors
            elizaLogger.error('Telegram connection network error:', error);
            this.handleBotError(error);
        }
    }
}
