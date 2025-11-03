import OpenAI from 'openai';
import { settings } from '@elizaos/core';

export class EmbeddingService {
    private openai: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string = 'text-embedding-ada-002') {
        this.openai = new OpenAI({
            apiKey: apiKey
        });
        this.model = model;
    }

    async createEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: text
            });
            return response.data[0].embedding;
        } catch (error) {
            console.error('Error creating embedding:', error);
            throw error;
        }
    }

    async generateEmbeddings(texts: string[]): Promise<number[][]> {
        try {
            const response = await this.openai.embeddings.create({
                model: this.model,
                input: texts
            });

            return response.data.data.map(item => item.embedding);
        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw error;
        }
    }
} 