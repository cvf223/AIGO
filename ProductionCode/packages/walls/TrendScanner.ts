import type { UUID, IAgentRuntime } from '../core/src/types';
import MemorySpine from '../core/src/memory/MemorySpine';
import PluginMesh from '../core/src/plugins/PluginMesh';

export interface SocialFeed {
    platform: 'twitter' | 'reddit' | 'discord' | 'telegram' | 'youtube';
    posts: SocialPost[];
    metadata: {
        fetchedAt: number;
        totalPosts: number;
        timeRange: {
            start: number;
            end: number;
        };
    };
}

export interface SocialPost {
    id: string;
    platform: string;
    author: string;
    content: string;
    timestamp: number;
    engagement: {
        likes: number;
        shares: number;
        comments: number;
        views?: number;
    };
    metadata: {
        verified: boolean;
        followerCount: number;
        accountAge: number;
        location?: string;
        hashtags: string[];
        mentions: string[];
        urls: string[];
    };
}

export interface TrendSignal {
    type: 'sentiment' | 'viral_content' | 'emerging_keyword' | 'influencer_activity' | 'price_correlation';
    confidence: number;
    strength: number;
    keywords: string[];
    sentiment: {
        score: number; // -1 to 1
        magnitude: number; // 0 to 1
        dominant: 'positive' | 'negative' | 'neutral';
    };
    timeframe: {
        detected: number;
        window: number; // analysis window in ms
    };
    sources: {
        platforms: string[];
        authorCount: number;
        postCount: number;
        totalEngagement: number;
    };
    metadata: {
        relatedSymbols?: string[];
        priceImpact?: number;
        viralityScore?: number;
        centrality?: number;
        anomalyScore?: number;
    };
}

export interface SentimentAnalysis {
    overall: {
        score: number;
        magnitude: number;
        confidence: number;
        dominant: 'positive' | 'negative' | 'neutral';
    };
    aspects: {
        [aspect: string]: {
            score: number;
            mentions: number;
        };
    };
    emotions: {
        joy: number;
        anger: number;
        fear: number;
        surprise: number;
        disgust: number;
        sadness: number;
    };
    keywords: Array<{
        term: string;
        frequency: number;
        sentiment: number;
        importance: number;
    }>;
}

/**
 * Trend Scanner - Social Media Intelligence for Castle
 * 
 * 💡 WHY: Monitors social sentiment, detects viral content, and identifies
 * emerging trends that could impact trading and investment decisions.
 * 
 * ⚙️ HOW: Uses RoBERTa sentiment analysis, graph centrality metrics,
 * and meme detection CNN for comprehensive social signal processing.
 */
export class TrendScanner {
    private runtime: IAgentRuntime;
    private memory: MemorySpine;
    private plugins: PluginMesh;
    
    private readonly platforms = ['twitter', 'reddit', 'discord', 'telegram'];
    private readonly sentimentThreshold = 0.7;
    private readonly viralityThreshold = 0.8;
    private readonly trendHistory: Map<string, TrendSignal[]> = new Map();

    constructor(
        runtime: IAgentRuntime,
        memory: MemorySpine,
        plugins: PluginMesh
    ) {
        this.runtime = runtime;
        this.memory = memory;
        this.plugins = plugins;
    }

    /**
     * Main trend scanning function as specified in masterplan
     */
    async scanTrends(feed: SocialFeed): Promise<TrendSignal[]> {
        // add logic here – RoBERTa sentiment + graph centrality + meme detection CNN
        console.log(`Scanning trends from ${feed.platform} with ${feed.posts.length} posts`);

        try {
            // Step 1: Sentiment Analysis using RoBERTa
            const sentimentAnalysis = await this.performSentimentAnalysis(feed.posts);
            
            // Step 2: Graph Centrality Analysis
            const centralityAnalysis = await this.performCentralityAnalysis(feed.posts);
            
            // Step 3: Meme Detection using CNN
            const memeSignals = await this.detectMemes(feed.posts);
            
            // Step 4: Viral Content Detection
            const viralSignals = await this.detectViralContent(feed.posts);
            
            // Step 5: Keyword Emergence Detection
            const keywordSignals = await this.detectEmergingKeywords(feed.posts);
            
            // Step 6: Influencer Activity Analysis
            const influencerSignals = await this.analyzeInfluencerActivity(feed.posts);
            
            // Step 7: Price Correlation Analysis
            const priceSignals = await this.analyzePriceCorrelations(feed.posts, sentimentAnalysis);
            
            // Combine all signals
            const allSignals = [
                ...this.createSentimentSignals(sentimentAnalysis, feed),
                ...memeSignals,
                ...viralSignals,
                ...keywordSignals,
                ...influencerSignals,
                ...priceSignals
            ];
            
            // Filter and rank signals
            const filteredSignals = this.filterAndRankSignals(allSignals);
            
            // Store signals in memory for future analysis
            await this.storeSignalsInMemory(filteredSignals, feed);
            
            return filteredSignals;

        } catch (error) {
            console.error('Trend scanning failed:', error);
            return [];
        }
    }

    /**
     * Perform RoBERTa-based sentiment analysis
     */
    private async performSentimentAnalysis(posts: SocialPost[]): Promise<SentimentAnalysis> {
        // add logic here – use RoBERTa model for sentiment analysis
        const combinedText = posts.map(p => p.content).join(' ');
        
        try {
            // Call sentiment analysis plugin
            const sentimentResult = await this.plugins.call(
                'plugin-nlp',
                'analyzeSentiment',
                [combinedText, { model: 'roberta-base-sentiment' }]
            );

            if (sentimentResult.success) {
                const data = sentimentResult.data as any;
                return {
                    overall: {
                        score: data.score || 0,
                        magnitude: data.magnitude || 0,
                        confidence: data.confidence || 0,
                        dominant: data.dominant || 'neutral'
                    },
                    aspects: data.aspects || {},
                    emotions: data.emotions || {
                        joy: 0, anger: 0, fear: 0, surprise: 0, disgust: 0, sadness: 0
                    },
                    keywords: data.keywords || []
                };
            }
        } catch (error) {
            console.error('Sentiment analysis failed:', error);
        }

        // Fallback simple sentiment analysis
        return this.performSimpleSentimentAnalysis(posts);
    }

    /**
     * Perform graph centrality analysis for influence detection
     */
    private async performCentralityAnalysis(posts: SocialPost[]): Promise<{
        influentialAuthors: Array<{ author: string; centrality: number; reach: number }>;
        keyInteractions: Array<{ source: string; target: string; weight: number }>;
    }> {
        // add logic here – build interaction graph and calculate centrality metrics
        const interactions = this.buildInteractionGraph(posts);
        const centralities = this.calculateCentralityMetrics(interactions);
        
        return {
            influentialAuthors: centralities.slice(0, 10), // Top 10 influential authors
            keyInteractions: interactions.slice(0, 20)     // Top 20 interactions
        };
    }

    /**
     * Detect memes using CNN-based content analysis
     */
    private async detectMemes(posts: SocialPost[]): Promise<TrendSignal[]> {
        // add logic here – use CNN for meme pattern detection
        const memeSignals: TrendSignal[] = [];
        
        for (const post of posts) {
            try {
                // Check for meme patterns
                const memeScore = await this.analyzeMemeContent(post);
                
                if (memeScore > 0.6) {
                    memeSignals.push({
                        type: 'viral_content',
                        confidence: memeScore,
                        strength: post.engagement.likes + post.engagement.shares,
                        keywords: post.metadata.hashtags,
                        sentiment: {
                            score: 0.5, // Neutral for memes initially
                            magnitude: 0.7,
                            dominant: 'neutral'
                        },
                        timeframe: {
                            detected: Date.now(),
                            window: 3600000 // 1 hour
                        },
                        sources: {
                            platforms: [post.platform],
                            authorCount: 1,
                            postCount: 1,
                            totalEngagement: post.engagement.likes + post.engagement.shares + post.engagement.comments
                        },
                        metadata: {
                            viralityScore: memeScore,
                            relatedSymbols: this.extractSymbols(post.content)
                        }
                    });
                }
            } catch (error) {
                console.error('Meme detection failed for post:', post.id, error);
            }
        }
        
        return memeSignals;
    }

    /**
     * Detect viral content based on engagement patterns
     */
    private async detectViralContent(posts: SocialPost[]): Promise<TrendSignal[]> {
        const viralSignals: TrendSignal[] = [];
        
        for (const post of posts) {
            const viralityScore = this.calculateViralityScore(post);
            
            if (viralityScore > this.viralityThreshold) {
                viralSignals.push({
                    type: 'viral_content',
                    confidence: viralityScore,
                    strength: viralityScore * 100,
                    keywords: post.metadata.hashtags,
                    sentiment: {
                        score: 0, // Will be filled by sentiment analysis
                        magnitude: 0.8,
                        dominant: 'neutral'
                    },
                    timeframe: {
                        detected: Date.now(),
                        window: 7200000 // 2 hours
                    },
                    sources: {
                        platforms: [post.platform],
                        authorCount: 1,
                        postCount: 1,
                        totalEngagement: post.engagement.likes + post.engagement.shares + post.engagement.comments
                    },
                    metadata: {
                        viralityScore,
                        relatedSymbols: this.extractSymbols(post.content)
                    }
                });
            }
        }
        
        return viralSignals;
    }

    /**
     * Detect emerging keywords and topics
     */
    private async detectEmergingKeywords(posts: SocialPost[]): Promise<TrendSignal[]> {
        const keywordFreq = new Map<string, number>();
        const keywordPosts = new Map<string, SocialPost[]>();
        
        // Extract and count keywords
        for (const post of posts) {
            const keywords = this.extractKeywords(post.content);
            for (const keyword of keywords) {
                keywordFreq.set(keyword, (keywordFreq.get(keyword) || 0) + 1);
                if (!keywordPosts.has(keyword)) {
                    keywordPosts.set(keyword, []);
                }
                keywordPosts.get(keyword)!.push(post);
            }
        }
        
        const emergingSignals: TrendSignal[] = [];
        
        // Find emerging keywords (high frequency, recent appearance)
        for (const [keyword, frequency] of keywordFreq.entries()) {
            if (frequency > 5) { // Threshold for emergence
                const relatedPosts = keywordPosts.get(keyword)!;
                const avgEngagement = relatedPosts.reduce((sum, post) => 
                    sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
                ) / relatedPosts.length;
                
                emergingSignals.push({
                    type: 'emerging_keyword',
                    confidence: Math.min(frequency / 20, 1), // Scale confidence
                    strength: avgEngagement,
                    keywords: [keyword],
                    sentiment: {
                        score: 0, // Will be filled by sentiment analysis
                        magnitude: 0.6,
                        dominant: 'neutral'
                    },
                    timeframe: {
                        detected: Date.now(),
                        window: 3600000 // 1 hour
                    },
                    sources: {
                        platforms: [...new Set(relatedPosts.map(p => p.platform))],
                        authorCount: new Set(relatedPosts.map(p => p.author)).size,
                        postCount: relatedPosts.length,
                        totalEngagement: relatedPosts.reduce((sum, post) => 
                            sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
                        )
                    },
                    metadata: {
                        relatedSymbols: this.extractSymbols(relatedPosts.map(p => p.content).join(' '))
                    }
                });
            }
        }
        
        return emergingSignals;
    }

    /**
     * Analyze influencer activity patterns
     */
    private async analyzeInfluencerActivity(posts: SocialPost[]): Promise<TrendSignal[]> {
        const influencerSignals: TrendSignal[] = [];
        
        // Find high-influence authors
        const influencers = posts.filter(post => 
            post.metadata.verified || 
            post.metadata.followerCount > 10000 ||
            post.engagement.likes + post.engagement.shares > 1000
        );
        
        if (influencers.length > 0) {
            const totalEngagement = influencers.reduce((sum, post) => 
                sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
            );
            
            influencerSignals.push({
                type: 'influencer_activity',
                confidence: 0.8,
                strength: totalEngagement,
                keywords: [...new Set(influencers.flatMap(p => p.metadata.hashtags))],
                sentiment: {
                    score: 0, // Will be filled by sentiment analysis
                    magnitude: 0.9,
                    dominant: 'neutral'
                },
                timeframe: {
                    detected: Date.now(),
                    window: 3600000 // 1 hour
                },
                sources: {
                    platforms: [...new Set(influencers.map(p => p.platform))],
                    authorCount: new Set(influencers.map(p => p.author)).size,
                    postCount: influencers.length,
                    totalEngagement
                },
                metadata: {
                    relatedSymbols: this.extractSymbols(influencers.map(p => p.content).join(' '))
                }
            });
        }
        
        return influencerSignals;
    }

    /**
     * Analyze price correlation with social signals
     */
    private async analyzePriceCorrelations(posts: SocialPost[], sentiment: SentimentAnalysis): Promise<TrendSignal[]> {
        const priceSignals: TrendSignal[] = [];
        
        // Extract mentioned crypto symbols
        const symbols = new Set<string>();
        posts.forEach(post => {
            this.extractSymbols(post.content).forEach(symbol => symbols.add(symbol));
        });
        
        for (const symbol of symbols) {
            const mentionCount = posts.filter(post => 
                post.content.toLowerCase().includes(symbol.toLowerCase())
            ).length;
            
            if (mentionCount > 3) { // Threshold for significant mentions
                priceSignals.push({
                    type: 'price_correlation',
                    confidence: Math.min(mentionCount / 20, 1),
                    strength: sentiment.overall.magnitude * 100,
                    keywords: [symbol],
                    sentiment: sentiment.overall,
                    timeframe: {
                        detected: Date.now(),
                        window: 3600000 // 1 hour
                    },
                    sources: {
                        platforms: [...new Set(posts.map(p => p.platform))],
                        authorCount: new Set(posts.map(p => p.author)).size,
                        postCount: mentionCount,
                        totalEngagement: posts.reduce((sum, post) => 
                            sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
                        )
                    },
                    metadata: {
                        relatedSymbols: [symbol],
                        priceImpact: sentiment.overall.score * mentionCount / 100
                    }
                });
            }
        }
        
        return priceSignals;
    }

    // Helper methods

    private createSentimentSignals(sentiment: SentimentAnalysis, feed: SocialFeed): TrendSignal[] {
        if (Math.abs(sentiment.overall.score) > this.sentimentThreshold) {
            return [{
                type: 'sentiment',
                confidence: sentiment.overall.confidence,
                strength: sentiment.overall.magnitude * 100,
                keywords: sentiment.keywords.slice(0, 5).map(k => k.term),
                sentiment: sentiment.overall,
                timeframe: {
                    detected: Date.now(),
                    window: 3600000 // 1 hour
                },
                sources: {
                    platforms: [feed.platform],
                    authorCount: new Set(feed.posts.map(p => p.author)).size,
                    postCount: feed.posts.length,
                    totalEngagement: feed.posts.reduce((sum, post) => 
                        sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
                    )
                },
                metadata: {}
            }];
        }
        return [];
    }

    private filterAndRankSignals(signals: TrendSignal[]): TrendSignal[] {
        return signals
            .filter(signal => signal.confidence > 0.5)
            .sort((a, b) => (b.confidence * b.strength) - (a.confidence * a.strength))
            .slice(0, 20); // Top 20 signals
    }

    private async storeSignalsInMemory(signals: TrendSignal[], feed: SocialFeed): Promise<void> {
        for (const signal of signals) {
            await this.memory.write({
                type: 'store',
                roomId: this.runtime.agentId, // Use agent ID as room for global signals
                agentId: this.runtime.agentId,
                content: {
                    type: 'trend_signal',
                    signal,
                    source: feed.platform,
                    detectedAt: Date.now()
                },
                timestamp: Date.now(),
                metadata: {
                    signalType: signal.type,
                    confidence: signal.confidence,
                    platform: feed.platform
                }
            });
        }
    }

    // Utility methods

    private performSimpleSentimentAnalysis(posts: SocialPost[]): SentimentAnalysis {
        // Fallback sentiment analysis
        const positiveWords = ['great', 'amazing', 'bullish', 'moon', 'pump', 'buy'];
        const negativeWords = ['bad', 'terrible', 'bearish', 'dump', 'sell', 'crash'];
        
        let totalScore = 0;
        const keywordCounts = new Map<string, number>();
        
        for (const post of posts) {
            const words = post.content.toLowerCase().split(/\s+/);
            let postScore = 0;
            
            for (const word of words) {
                if (positiveWords.includes(word)) postScore += 1;
                if (negativeWords.includes(word)) postScore -= 1;
                keywordCounts.set(word, (keywordCounts.get(word) || 0) + 1);
            }
            
            totalScore += postScore;
        }
        
        const avgScore = totalScore / posts.length;
        const normalizedScore = Math.max(-1, Math.min(1, avgScore / 5));
        
        return {
            overall: {
                score: normalizedScore,
                magnitude: Math.abs(normalizedScore),
                confidence: 0.6,
                dominant: normalizedScore > 0.1 ? 'positive' : 
                         normalizedScore < -0.1 ? 'negative' : 'neutral'
            },
            aspects: {},
            emotions: {
                joy: normalizedScore > 0 ? normalizedScore : 0,
                anger: normalizedScore < 0 ? -normalizedScore : 0,
                fear: 0, surprise: 0, disgust: 0, sadness: 0
            },
            keywords: Array.from(keywordCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([term, frequency]) => ({
                    term,
                    frequency,
                    sentiment: 0,
                    importance: frequency / posts.length
                }))
        };
    }

    private buildInteractionGraph(posts: SocialPost[]): Array<{ source: string; target: string; weight: number }> {
        const interactions: Array<{ source: string; target: string; weight: number }> = [];
        
        for (const post of posts) {
            for (const mention of post.metadata.mentions) {
                interactions.push({
                    source: post.author,
                    target: mention,
                    weight: post.engagement.likes + post.engagement.shares
                });
            }
        }
        
        return interactions.sort((a, b) => b.weight - a.weight);
    }

    private calculateCentralityMetrics(interactions: Array<{ source: string; target: string; weight: number }>): Array<{ author: string; centrality: number; reach: number }> {
        const authorMetrics = new Map<string, { centrality: number; reach: number }>();
        
        for (const interaction of interactions) {
            if (!authorMetrics.has(interaction.source)) {
                authorMetrics.set(interaction.source, { centrality: 0, reach: 0 });
            }
            const metrics = authorMetrics.get(interaction.source)!;
            metrics.centrality += interaction.weight;
            metrics.reach += 1;
        }
        
        return Array.from(authorMetrics.entries())
            .map(([author, metrics]) => ({ author, ...metrics }))
            .sort((a, b) => b.centrality - a.centrality);
    }

    private async analyzeMemeContent(post: SocialPost): Promise<number> {
        // Simple meme detection - in practice would use CNN
        const memeIndicators = [
            'meme', 'viral', 'trending', 'hodl', 'diamond hands', 
            'to the moon', 'wen', 'gm', 'gn', 'wagmi', 'ngmi'
        ];
        
        const content = post.content.toLowerCase();
        let memeScore = 0;
        
        for (const indicator of memeIndicators) {
            if (content.includes(indicator)) {
                memeScore += 0.2;
            }
        }
        
        // Boost score for high engagement
        if (post.engagement.shares > 100) memeScore += 0.3;
        if (post.metadata.hashtags.length > 3) memeScore += 0.2;
        
        return Math.min(memeScore, 1.0);
    }

    private calculateViralityScore(post: SocialPost): number {
        const engagement = post.engagement.likes + post.engagement.shares + post.engagement.comments;
        const authorInfluence = Math.log10(post.metadata.followerCount + 1) / 6; // Normalize
        const timeDecay = Math.exp(-(Date.now() - post.timestamp) / (1000 * 60 * 60)); // Hour decay
        
        return Math.min(
            (engagement / 1000) * authorInfluence * timeDecay,
            1.0
        );
    }

    private extractKeywords(content: string): string[] {
        const words = content.toLowerCase()
            .replace(/[^\w\s#@]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !this.isStopWord(word));
        
        return [...new Set(words)]; // Remove duplicates
    }

    private extractSymbols(content: string): string[] {
        const symbolRegex = /\$([A-Z]{2,10})|#([A-Z]{2,10})|([A-Z]{2,10})(?=\s|$)/g;
        const matches = content.match(symbolRegex) || [];
        return matches.map(match => match.replace(/[$#]/g, '').toUpperCase());
    }

    private isStopWord(word: string): boolean {
        const stopWords = new Set([
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        ]);
        return stopWords.has(word.toLowerCase());
    }
}

/**
 * Main trend scanning function for external use
 */
export async function scanTrends(feed: SocialFeed): Promise<TrendSignal[]> {
    // add logic here – RoBERTa sentiment + graph centrality + meme detection CNN
    // This is a simplified implementation - full implementation would need proper NLP models
    
    const scanner = new TrendScanner(
        {} as IAgentRuntime, // Would need proper runtime
        {} as MemorySpine,   // Would need proper memory
        {} as PluginMesh     // Would need proper plugins
    );
    
    return scanner.scanTrends(feed);
}

export default TrendScanner; 