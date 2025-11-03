import { Context } from "telegraf";
import { elizaLogger } from "@elizaos/core";

interface Attachment {
    type: 'photo' | 'document';
    fileId: string;
}

interface QueuedMessage {
    priority: number;
    message: string;
    chatId: string;
    attachments?: Attachment[];
    timestamp: number;
    retryCount: number;
    maxRetries: number;
    parseMode?: 'HTML' | 'Markdown';
    replyToMessageId?: number;
}

class PriorityQueue<T> {
    private items: T[] = [];
    private compareFn: (a: T, b: T) => number;

    constructor(compareFn: (a: T, b: T) => number) {
        this.compareFn = compareFn;
    }

    push(item: T): void {
        this.items.push(item);
        this.items.sort(this.compareFn);
    }

    pop(): T | undefined {
        return this.items.shift();
    }

    peek(): T | undefined {
        return this.items[0];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    size(): number {
        return this.items.length;
    }
}

class RateLimiter {
    private maxRequests: number;
    private timeWindow: number;
    private requests: number[] = [];

    constructor(options: { maxRequests: number; timeWindow: number }) {
        this.maxRequests = options.maxRequests;
        this.timeWindow = options.timeWindow;
    }

    async tryAcquire(): Promise<boolean> {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            return true;
        }
        
        return false;
    }

    getRemainingRequests(): number {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        return this.maxRequests - this.requests.length;
    }

    getTimeUntilNextAvailable(): number {
        if (this.requests.length < this.maxRequests) {
            return 0;
        }
        const oldestRequest = this.requests[0];
        return Math.max(0, oldestRequest + this.timeWindow - Date.now());
    }
}

export class MessageQueue {
    private queue: PriorityQueue<QueuedMessage>;
    private rateLimiter: RateLimiter;
    private processing: boolean = false;
    private bot: any; // We'll type this properly when we integrate it

    constructor(bot: any, options: { maxRequestsPerMinute?: number; timeWindow?: number } = {}) {
        this.bot = bot;
        this.queue = new PriorityQueue<QueuedMessage>((a, b) => b.priority - a.priority);
        this.rateLimiter = new RateLimiter({
            maxRequests: options.maxRequestsPerMinute || 20, // Telegram's default limit
            timeWindow: options.timeWindow || 60000 // 1 minute
        });
    }

    async enqueue(message: Omit<QueuedMessage, 'timestamp' | 'retryCount'>) {
        const queuedMessage: QueuedMessage = {
            ...message,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries: 3
        };
        
        this.queue.push(queuedMessage);
        elizaLogger.debug(`Message enqueued with priority ${queuedMessage.priority}`);
        
        if (!this.processing) {
            this.processQueue();
        }
    }

    private async processQueue() {
        this.processing = true;
        
        while (!this.queue.isEmpty()) {
            const message = this.queue.peek();
            if (!message) break;

            if (await this.rateLimiter.tryAcquire()) {
                try {
                    await this.sendMessage(message);
                    this.queue.pop();
                    elizaLogger.debug(`Message sent successfully to chat ${message.chatId}`);
                } catch (error: any) {
                    if (error.code === 409 && message.retryCount < message.maxRetries) {
                        // Conflict error - wait and retry
                        message.retryCount++;
                        const delay = 1000 * Math.pow(2, message.retryCount); // Exponential backoff
                        elizaLogger.warn(`Message conflict, retrying in ${delay}ms (attempt ${message.retryCount}/${message.maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else {
                        // Other error or max retries reached
                        this.queue.pop();
                        elizaLogger.error('Failed to send message:', error);
                    }
                }
            } else {
                // Rate limit reached, wait before next attempt
                const waitTime = this.rateLimiter.getTimeUntilNextAvailable();
                elizaLogger.debug(`Rate limit reached, waiting ${waitTime}ms`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        this.processing = false;
    }

    private async sendMessage(message: QueuedMessage) {
        const options: any = {
            parse_mode: message.parseMode || 'HTML'
        };

        if (message.replyToMessageId) {
            options.reply_parameters = { message_id: message.replyToMessageId };
        }

        // Handle attachments first if any
        if (message.attachments?.length) {
            for (const attachment of message.attachments) {
                if (attachment.type === 'photo') {
                    await this.bot.telegram.sendPhoto(message.chatId, attachment.fileId, {
                        ...options,
                        caption: message.message
                    });
                } else if (attachment.type === 'document') {
                    await this.bot.telegram.sendDocument(message.chatId, attachment.fileId, {
                        ...options,
                        caption: message.message
                    });
                }
            }
        } else {
            // Split message into chunks if it's too long
            const chunks = this.splitMessage(message.message);
            for (const chunk of chunks) {
                await this.bot.telegram.sendMessage(message.chatId, chunk, options);
            }
        }
    }

    private splitMessage(text: string, maxLength = 4096): string[] {
        const chunks: string[] = [];
        let currentChunk = "";

        const lines = text.split("\n");
        for (const line of lines) {
            if (currentChunk.length + line.length + 1 <= maxLength) {
                currentChunk += (currentChunk ? "\n" : "") + line;
            } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = line;
            }
        }

        if (currentChunk) chunks.push(currentChunk);
        return chunks;
    }

    getQueueSize(): number {
        return this.queue.size();
    }

    getRemainingRateLimit(): number {
        return this.rateLimiter.getRemainingRequests();
    }
} 