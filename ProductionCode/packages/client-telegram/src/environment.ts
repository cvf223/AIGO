import type { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

const telegramEnvSchema = z.object({
    TELEGRAM_BOT_TOKEN: z.string().min(1, "Telegram bot token is required"),
    TELEGRAM_WEBHOOK_URL: z.string().optional(),
    TELEGRAM_WEBHOOK_PORT: z.string().optional(),
    TELEGRAM_API_ROOT: z.string().optional()
});

export type TelegramConfig = z.infer<typeof telegramEnvSchema>;

export async function validateTelegramConfig(
    runtime: IAgentRuntime
): Promise<TelegramConfig> {
    try {
        const config = {
            TELEGRAM_BOT_TOKEN:
                runtime.getSetting("TELEGRAM_BOT_TOKEN") ||
                process.env.TELEGRAM_BOT_TOKEN,
            TELEGRAM_WEBHOOK_URL:
                runtime.getSetting("TELEGRAM_WEBHOOK_URL") ||
                process.env.TELEGRAM_WEBHOOK_URL,
            TELEGRAM_WEBHOOK_PORT:
                runtime.getSetting("TELEGRAM_WEBHOOK_PORT") ||
                process.env.TELEGRAM_WEBHOOK_PORT,
            TELEGRAM_API_ROOT:
                runtime.getSetting("TELEGRAM_API_ROOT") ||
                process.env.TELEGRAM_API_ROOT
        };

        return telegramEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Telegram configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
