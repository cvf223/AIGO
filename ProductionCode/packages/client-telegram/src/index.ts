import { type IAgentRuntime } from "@elizaos/core";
import { TelegramClient } from "./telegramClient";
import { WebhookServer } from "./webhookServer";
import { validateTelegramConfig } from "./environment";

let webhookServer: WebhookServer | null = null;

export async function createTelegramClient(runtime: IAgentRuntime): Promise<TelegramClient> {
    // Validate configuration
    await validateTelegramConfig(runtime);

    // Initialize webhook server if not already running
    if (!webhookServer) {
        const port = parseInt(runtime.getSetting("TELEGRAM_WEBHOOK_PORT") || process.env.TELEGRAM_WEBHOOK_PORT || "8443");
        webhookServer = new WebhookServer(port);
        await webhookServer.start();
    }

    // Create and initialize the client
    const client = new TelegramClient(runtime, runtime.getSetting("TELEGRAM_BOT_TOKEN") || process.env.TELEGRAM_BOT_TOKEN || "");
    await client.init();

    // Register the bot with the webhook server
    if (webhookServer && client.botUsername) {
        webhookServer.registerBot(client.botUsername, client.bot);
    }

    return client;
}

export async function cleanupTelegramClient(client: TelegramClient): Promise<void> {
    if (webhookServer && client.botUsername) {
        webhookServer.unregisterBot(client.botUsername);
    }
    await client.cleanup();
}

export { TelegramClient } from "./telegramClient";
export { WebhookServer } from "./webhookServer";
