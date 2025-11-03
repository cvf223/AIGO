import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelegramClient } from '../src/telegramClient';
import type { IAgentRuntime, Character, ModelProviderName } from '@elizaos/core';

// Mock Telegraf
vi.mock('telegraf', () => {
    const mockBot = {
        launch: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
        telegram: {
            getMe: vi.fn().mockResolvedValue({ username: 'test_bot' })
        },
        on: vi.fn(),
        command: vi.fn(),
        use: vi.fn(),
        catch: vi.fn()
    };

    return {
        Telegraf: vi.fn(() => mockBot)
    };
});

describe('TelegramClient', () => {
    let mockRuntime: Partial<IAgentRuntime>;
    let client: TelegramClient;
    const TEST_BOT_TOKEN = 'test_bot_token';

    beforeEach(() => {
        const mockCharacter: Partial<Character> = {
            id: '12345678-1234-1234-1234-123456789012',
            name: 'Test Bot',
            modelProvider: 'openai' as ModelProviderName,
            bio: 'Test bio',
            lore: ['Test lore'],
            templates: {},
            messageExamples: [],
            postExamples: [],
            topics: [],
            adjectives: [],
            plugins: [],
            style: {
                all: [],
                chat: [],
                post: []
            },
            clientConfig: {
                telegram: {
                    autoPost: {
                        enabled: false,
                        monitorTime: 300000,
                        inactivityThreshold: 3600000,
                        mainChannelId: "test-channel",
                        pinnedMessagesGroups: [],
                        minTimeBetweenPosts: 7200000
                    },
                    isPartOfTeam: false,
                    teamAgentIds: []
                }
            }
        };

        mockRuntime = {
            getSetting: vi.fn((key: string) => {
                switch (key) {
                    case 'BACKEND_URL':
                        return 'http://localhost:3000';
                    case 'BACKEND_TOKEN':
                        return 'test_backend_token';
                    case 'TG_TRADER':
                        return 'false';
                    default:
                        return null;
                }
            }),
            character: mockCharacter as Character
        };

        client = new TelegramClient(mockRuntime as IAgentRuntime, TEST_BOT_TOKEN);
    });

    describe('initialization', () => {
        it('should create a new instance with the provided runtime and token', () => {
            expect(client).toBeInstanceOf(TelegramClient);
        });

        it('should initialize with correct settings from runtime', () => {
            expect(mockRuntime.getSetting).toHaveBeenCalledWith('BACKEND_URL');
            expect(mockRuntime.getSetting).toHaveBeenCalledWith('BACKEND_TOKEN');
            expect(mockRuntime.getSetting).toHaveBeenCalledWith('TG_TRADER');
        });
    });

    describe('bot lifecycle', () => {
        it('should start the bot successfully', async () => {
            const mockBot = client['bot'];
            const launchSpy = vi.spyOn(mockBot, 'launch');
            const getMeSpy = vi.spyOn(mockBot.telegram, 'getMe');

            await client.start();

            expect(launchSpy).toHaveBeenCalledWith({ dropPendingUpdates: true });
            expect(getMeSpy).toHaveBeenCalled();
        });

        it('should get bot info after launch', async () => {
            const mockBot = client['bot'];
            const getMeSpy = vi.spyOn(mockBot.telegram, 'getMe');

            await client.start();

            expect(getMeSpy).toHaveBeenCalled();
        });
    });
});
