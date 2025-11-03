import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageManager } from '../src/messageManager';
import type { IAgentRuntime, IDatabaseAdapter, Character, ModelProviderName, Memory, State } from '@elizaos/core';
import { type Context, Telegraf } from 'telegraf';
import { Message } from '@telegraf/types';

// Mock Telegraf
vi.mock('telegraf', () => {
    return {
        Telegraf: vi.fn().mockImplementation(() => ({
            telegram: {
                sendMessage: vi.fn().mockResolvedValue({ message_id: 123 }),
                sendChatAction: vi.fn().mockResolvedValue(true),
                sendPhoto: vi.fn().mockResolvedValue({ message_id: 124 })
            },
            botInfo: {
                id: 123456789,
                is_bot: true,
                first_name: 'Test Bot',
                username: 'test_bot'
            }
        }))
    };
});

// Mock fs module for image handling
vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn().mockReturnValue(true),
        createReadStream: vi.fn().mockReturnValue({})
    }
}));

describe('MessageManager', () => {
    let mockRuntime: Partial<IAgentRuntime>;
    let mockBot: Telegraf<Context>;
    let messageManager: MessageManager;
    const CHAT_ID = 123456789;

    beforeEach(() => {
        const mockDb: Partial<IDatabaseAdapter> = {
            db: {} as any,
            init: vi.fn(),
            close: vi.fn(),
            getAccountById: vi.fn(),
            log: vi.fn().mockResolvedValue(undefined)
        };

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
            getSetting: vi.fn(),
            plugins: [],
            databaseAdapter: mockDb as IDatabaseAdapter,
            character: mockCharacter as Character,
            agentId: '12345678-1234-1234-1234-123456789012',
            messageManager: {
                runtime: mockRuntime as IAgentRuntime,
                tableName: 'memories',
                getMemories: vi.fn().mockResolvedValue([]),
                createMemory: vi.fn().mockResolvedValue(undefined),
                addEmbeddingToMemory: vi.fn(),
                getCachedEmbeddings: vi.fn(),
                getMemoryById: vi.fn(),
                getMemoriesByRoomIds: vi.fn(),
                searchMemoriesByEmbedding: vi.fn(),
                removeMemory: vi.fn(),
                removeAllMemories: vi.fn(),
                countMemories: vi.fn()
            },
            composeState: vi.fn().mockImplementation(async (memory: Memory) => ({
                memory,
                roomId: memory.roomId,
                actors: [],
                recentMessages: [],
                recentMemories: [],
                recentMessagesData: [],
                bio: mockCharacter.bio || '',
                lore: mockCharacter.lore || [],
                messageDirections: [],
                postDirections: [],
                topics: mockCharacter.topics || [],
                adjectives: mockCharacter.adjectives || [],
                style: mockCharacter.style || { all: [], chat: [], post: [] }
            } as unknown as State)),
            evaluate: vi.fn().mockResolvedValue(undefined),
            updateRecentMessageState: vi.fn().mockImplementation(async (state: State) => state)
        };

        mockBot = new Telegraf('mock_token') as any;
        messageManager = new MessageManager(mockBot, mockRuntime as IAgentRuntime);
        vi.clearAllMocks();
    });

    describe('message sending', () => {
        it('should send a message successfully', async () => {
            const message = {
                message_id: 123,
                text: 'Test message',
                from: {
                    id: 987654321,
                    is_bot: false,
                    first_name: 'Test User'
                },
                chat: { id: CHAT_ID, type: 'private' },
                date: Date.now() / 1000
            } as Message;

            const ctx = {
                message,
                from: message.from,
                chat: message.chat,
                telegram: mockBot.telegram
            } as Context;
            
            await messageManager.handleMessage(ctx);
            
            expect(mockBot.telegram.sendMessage).toHaveBeenCalledWith(
                CHAT_ID,
                expect.any(String),
                expect.objectContaining({
                    parse_mode: 'Markdown'
                })
            );
        });

        it('should split long messages', async () => {
            const message = {
                message_id: 123,
                text: 'a'.repeat(4096) + '\nb'.repeat(100),
                from: {
                    id: 987654321,
                    is_bot: false,
                    first_name: 'Test User'
                },
                chat: { id: CHAT_ID, type: 'private' },
                date: Date.now() / 1000
            } as Message;

            const ctx = {
                message,
                from: message.from,
                chat: message.chat,
                telegram: mockBot.telegram
            } as Context;
            
            await messageManager.handleMessage(ctx);
            
            expect(mockBot.telegram.sendMessage).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle send message errors', async () => {
            const message = {
                message_id: 123,
                text: 'Test message',
                from: {
                    id: 987654321,
                    is_bot: false,
                    first_name: 'Test User'
                },
                chat: { id: CHAT_ID, type: 'private' },
                date: Date.now() / 1000
            } as Message;

            const ctx = {
                message,
                from: message.from,
                chat: message.chat,
                telegram: mockBot.telegram
            } as Context;
            
            const error = new Error('Network error');
            vi.spyOn(mockBot.telegram, 'sendMessage').mockRejectedValueOnce(error);
            
            await expect(messageManager.handleMessage(ctx))
                .rejects
                .toThrow('Network error');
        });
    });
});
