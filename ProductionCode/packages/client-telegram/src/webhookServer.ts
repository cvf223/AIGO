import express from 'express';
import { type Telegraf } from 'telegraf';
import { elizaLogger } from '@elizaos/core';

export class WebhookServer {
    private app: express.Application;
    private port: number;
    private bots: Map<string, Telegraf> = new Map();

    constructor(port: number = 8443) {
        this.port = port;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware(): void {
        this.app.use(express.json());
    }

    private setupRoutes(): void {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok' });
        });

        // Dynamic webhook endpoint for each bot
        this.app.post('/telegram-webhook/:botUsername', async (req, res) => {
            const { botUsername } = req.params;
            const bot = this.bots.get(botUsername);

            if (!bot) {
                elizaLogger.warn(`Received webhook for unknown bot: ${botUsername}`);
                return res.status(404).json({ error: 'Bot not found' });
            }

            try {
                await bot.handleUpdate(req.body);
                res.status(200).json({ status: 'ok' });
            } catch (error) {
                elizaLogger.error(`Error handling webhook for bot ${botUsername}:`, error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });
    }

    public registerBot(botUsername: string, bot: Telegraf): void {
        this.bots.set(botUsername, bot);
        elizaLogger.info(`Registered bot ${botUsername} with webhook server`);
    }

    public unregisterBot(botUsername: string): void {
        this.bots.delete(botUsername);
        elizaLogger.info(`Unregistered bot ${botUsername} from webhook server`);
    }

    public async start(): Promise<void> {
        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                elizaLogger.info(`Webhook server listening on port ${this.port}`);
                resolve();
            });
        });
    }

    public async stop(): Promise<void> {
        // Cleanup logic if needed
        elizaLogger.info('Webhook server stopped');
    }
} 