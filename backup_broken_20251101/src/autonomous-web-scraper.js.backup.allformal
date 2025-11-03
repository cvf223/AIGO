/**
 * 🔍 AUTONOMOUS WEB SCRAPER - PRODUCTION IMPLEMENTATION
 * ===================================================
 * 
 * REAL WEB SCRAPING - NO MOCK IMPLEMENTATIONS
 * 
 * This system provides real web scraping capabilities using:
 * - Google Search API for real search results
 * - Puppeteer for real content fetching
 * - Real URL analysis and content extraction
 * - Production-grade error handling
 */

import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

// 🧠 LLM SUPPORT FOR HIGH-VALUE CONTENT ANALYSIS
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 🌌 THIRDWEB NEBULA - CRYPTO-NATIVE LLM
import { ThirdwebNebulaIntegration } from './llm/ThirdwebNebulaIntegration.js';

export class AutonomousWebScraper {
    constructor() {
        this.browser = null;
        this.googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
        this.searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
        this.rateLimits = {
            google: { requests: 0, resetTime: Date.now() + 86400000, limit: 100 }, // 100/day
            scraping: { requests: 0, resetTime: Date.now() + 3600000, limit: 1000 } // 1000/hour
        };
        
        // 🧠 MULTI-LLM SETUP FOR HIGH-VALUE ANALYSIS
        this.llmClients = {};
        this.thirdwebNebula = null;
        this.initializeLLMClients();
        
        // 📊 BATCH PROCESSING FOR COST OPTIMIZATION
        this.batchQueue = [];
        this.maxBatchSize = 10;
        this.batchProcessingInterval = 30000; // 30 seconds
        
        // 💰 COST TRACKING & INTELLIGENCE
        this.analysisStats = {
            totalRequests: 0,
            llmAnalyses: 0,
            batchedRequests: 0,
            estimatedCosts: 0,
            highValueFindings: 0
        };
        
        console.log('🔍 Autonomous Web Scraper initialized with MULTI-LLM support & batch processing');
    }
    
    /**
     * 🧠 INITIALIZE MULTI-LLM CLIENTS
     */
    initializeLLMClients() {
        try {
            // OpenAI GPT-4
            if (process.env.OPENAI_API_KEY) {
                this.llmClients.openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY
                });
                console.log('✅ OpenAI GPT-4 client initialized');
            }
            
            // Anthropic Claude
            if (process.env.ANTHROPIC_API_KEY) {
                this.llmClients.anthropic = new Anthropic({
                    apiKey: process.env.ANTHROPIC_API_KEY
                });
                console.log('✅ Anthropic Claude client initialized');
            }
            
            // Google Gemini
            if (process.env.GOOGLE_AI_API_KEY) {
                this.llmClients.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
                console.log('✅ Google Gemini client initialized');
            }
            
            // 🌌 Thirdweb Nebula - Crypto-Native LLM
            if (process.env.THIRDWEB_CLIENT_ID && process.env.THIRDWEB_SECRET_KEY) {
                this.thirdwebNebula = new ThirdwebNebulaIntegration({
                    clientId: process.env.THIRDWEB_CLIENT_ID,
                    secretKey: process.env.THIRDWEB_SECRET_KEY,
                    maxTokens: 2500,
                    temperature: 0.3 // Precise for arbitrage analysis
                });
                console.log('✅ Thirdweb Nebula crypto-native LLM initialized');
            }
            
            console.log(`🧠 Multi-LLM system ready with ${Object.keys(this.llmClients).length} providers`);
            
        } catch (error) {
            console.error('⚠️ LLM initialization failed:', error);
        }
    }
    
    /**
     * 🚀 INITIALIZE BROWSER
     */
    async initialize() {
        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
            
            console.log('🚀 Browser initialized for real web scraping');
            return true;
            
        } catch (error) {
            console.error('❌ Browser initialization failed:', error);
            return false;
        }
    }
    
    /**
     * 🔍 SEARCH WITH REAL GOOGLE SEARCH API
     */
    async searchWeb(searchTerm, numResults = 10) {
        try {
            console.log(`🔍 Performing REAL web search: "${searchTerm}"`);
            
            // Check rate limits
            if (!this.checkRateLimit('google')) {
                throw new Error('Google Search API rate limit exceeded');
            }
            
            if (!this.googleApiKey || !this.searchEngineId) {
                throw new Error('Google Search API credentials not configured');
            }
            
            const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(searchTerm)}&num=${numResults}`;
            
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(`Google Search API error: ${data.error?.message || 'Unknown error'}`);
            }
            
            // Increment rate limit counter
            this.rateLimits.google.requests++;
            
            const results = data.items?.map(item => ({
                title: item.title,
                url: item.link,
                snippet: item.snippet,
                displayLink: item.displayLink,
                formattedUrl: item.formattedUrl
            })) || [];
            
            console.log(`✅ Found ${results.length} real search results for "${searchTerm}"`);
            return results;
            
        } catch (error) {
            console.error(`❌ Real web search failed for "${searchTerm}":`, error);
            
            // Fallback to DuckDuckGo instant answer API
            return await this.fallbackSearch(searchTerm, numResults);
        }
    }
    
    /**
     * 🦆 FALLBACK SEARCH USING DUCKDUCKGO
     */
    async fallbackSearch(searchTerm, numResults = 10) {
        try {
            console.log(`🦆 Using DuckDuckGo fallback search for: "${searchTerm}"`);
            
            const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(searchTerm)}&format=json&no_html=1&skip_disambig=1`;
            
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            const results = [];
            
            // Add instant answer if available
            if (data.Answer) {
                results.push({
                    title: data.Heading || 'DuckDuckGo Instant Answer',
                    url: data.AbstractURL || '#',
                    snippet: data.Answer,
                    displayLink: 'duckduckgo.com',
                    formattedUrl: data.AbstractURL || '#'
                });
            }
            
            // Add related topics
            if (data.RelatedTopics) {
                for (const topic of data.RelatedTopics.slice(0, numResults - 1)) {
                    if (topic.Text && topic.FirstURL) {
                        results.push({
                            title: topic.Text.split(' - ')[0] || topic.Text,
                            url: topic.FirstURL,
                            snippet: topic.Text,
                            displayLink: new URL(topic.FirstURL).hostname,
                            formattedUrl: topic.FirstURL
                        });
                    }
                }
            }
            
            console.log(`✅ DuckDuckGo fallback returned ${results.length} results`);
            return results;
            
        } catch (error) {
            console.error('❌ Fallback search also failed:', error);
            return [];
        }
    }
    
    /**
     * 📄 FETCH REAL CONTENT FROM URL
     */
    async fetchContent(url) {
        try {
            console.log(`📄 Fetching REAL content from: ${url}`);
            
            // Check rate limits
            if (!this.checkRateLimit('scraping')) {
                throw new Error('Scraping rate limit exceeded');
            }
            
            if (!this.browser) {
                await this.initialize();
            }
            
            const page = await this.browser.newPage();
            
            // Set user agent and other headers
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            // Navigate to URL with timeout
            await page.goto(url, { 
                waitUntil: 'networkidle2', 
                timeout: 30000 
            });
            
            // Extract content using multiple methods
            const content = await page.evaluate(() => {
                // Try to get main content area
                const mainSelectors = [
                    'main',
                    'article',
                    '.content',
                    '.main-content',
                    '.post-content',
                    '.article-content',
                    '#content',
                    '.entry-content'
                ];
                
                let mainContent = '';
                for (const selector of mainSelectors) {
                    const element = document.querySelector(selector);
                    if (element) {
                        mainContent = element.innerText || element.textContent || '';
                        if (mainContent.length > 100) break;
                    }
                }
                
                // Fallback to body if no main content found
                if (!mainContent || mainContent.length < 100) {
                    mainContent = document.body.innerText || document.body.textContent || '';
                }
                
                return {
                    title: document.title || '',
                    content: mainContent,
                    url: window.location.href,
                    wordCount: mainContent.split(/\s+/).length,
                    lastModified: document.lastModified || '',
                    language: document.documentElement.lang || 'en'
                };
            });
            
            await page.close();
            
            // Increment rate limit counter
            this.rateLimits.scraping.requests++;
            
            // Use Readability for better content extraction
            const enhancedContent = await this.enhanceContentExtraction(url, content.content);
            
            const finalContent = {
                ...content,
                content: enhancedContent || content.content,
                wordCount: (enhancedContent || content.content).split(/\s+/).length,
                extractedAt: new Date().toISOString()
            };
            
            console.log(`✅ Content fetched - ${finalContent.wordCount} words from ${url}`);
            return finalContent;
            
        } catch (error) {
            console.error(`❌ Failed to fetch content from ${url}:`, error);
            
            // Fallback to simple fetch
            return await this.fallbackFetchContent(url);
        }
    }
    
    /**
     * 🔄 ENHANCE CONTENT EXTRACTION WITH READABILITY
     */
    async enhanceContentExtraction(url, rawContent) {
        try {
            // Fetch raw HTML for Readability
            const response = await fetch(url);
            const html = await response.text();
            
            const dom = new JSDOM(html, { url });
            const reader = new Readability(dom.window.document);
            const article = reader.parse();
            
            if (article && article.textContent) {
                return article.textContent;
            }
            
            return rawContent;
            
        } catch (error) {
            console.error('❌ Readability enhancement failed:', error);
            return rawContent;
        }
    }
    
    /**
     * 🔄 FALLBACK CONTENT FETCHING
     */
    async fallbackFetchContent(url) {
        try {
            console.log(`🔄 Using fallback content fetch for: ${url}`);
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const html = await response.text();
            const dom = new JSDOM(html);
            const document = dom.window.document;
            
            // Remove script and style elements
            const scripts = document.querySelectorAll('script, style');
            scripts.forEach(el => el.remove());
            
            const content = document.body.textContent || document.body.innerText || '';
            
            return {
                title: document.title || '',
                content: content,
                url: url,
                wordCount: content.split(/\s+/).length,
                extractedAt: new Date().toISOString(),
                method: 'fallback'
            };
            
        } catch (error) {
            console.error(`❌ Fallback content fetch failed for ${url}:`, error);
            return {
                title: 'Content Unavailable',
                content: '',
                url: url,
                wordCount: 0,
                error: error.message,
                extractedAt: new Date().toISOString()
            };
        }
    }
    
    /**
     * 🔍 ANALYZE CONTENT FOR ARBITRAGE INSIGHTS
     */
    async analyzeContentForArbitrageInsights(content) {
        const insights = [];
        const text = content.content.toLowerCase();
        
        // Look for arbitrage-related keywords
        const arbitrageKeywords = [
            'arbitrage', 'price difference', 'spread', 'dex', 'swap',
            'liquidity', 'flash loan', 'yield farming', 'defi',
            'uniswap', 'sushiswap', 'curve', 'balancer', 'aave'
        ];
        
        const foundKeywords = arbitrageKeywords.filter(keyword => 
            text.includes(keyword)
        );
        
        if (foundKeywords.length > 0) {
            insights.push({
                type: 'arbitrage_keywords',
                keywords: foundKeywords,
                relevanceScore: foundKeywords.length / arbitrageKeywords.length
            });
        }
        
        // Look for price mentions
        const priceRegex = /\$[\d,]+\.?\d*/g;
        const prices = text.match(priceRegex);
        if (prices && prices.length > 1) {
            insights.push({
                type: 'price_mentions',
                prices: prices,
                count: prices.length
            });
        }
        
        // Look for percentage mentions (spreads)
        const percentRegex = /\d+\.?\d*%/g;
        const percentages = text.match(percentRegex);
        if (percentages) {
            insights.push({
                type: 'percentage_mentions',
                percentages: percentages,
                count: percentages.length
            });
        }
        
        return {
            insights,
            relevanceScore: insights.length > 0 ? 
                insights.reduce((sum, insight) => sum + (insight.relevanceScore || 0.1), 0) / insights.length : 0,
            timestamp: Date.now()
        };
    }
    
    /**
     * 🛡️ CHECK RATE LIMITS
     */
    checkRateLimit(service) {
        const limit = this.rateLimits[service];
        
        // Reset counter if time period has passed
        if (Date.now() > limit.resetTime) {
            limit.requests = 0;
            if (service === 'google') {
                limit.resetTime = Date.now() + 86400000; // 24 hours
            } else {
                limit.resetTime = Date.now() + 3600000; // 1 hour
            }
        }
        
        return limit.requests < limit.limit;
    }
    
    /**
     * 📊 GET RATE LIMIT STATUS
     */
    getRateLimitStatus() {
        return {
            google: {
                used: this.rateLimits.google.requests,
                limit: this.rateLimits.google.limit,
                resetTime: new Date(this.rateLimits.google.resetTime).toISOString()
            },
            scraping: {
                used: this.rateLimits.scraping.requests,
                limit: this.rateLimits.scraping.limit,
                resetTime: new Date(this.rateLimits.scraping.resetTime).toISOString()
            }
        };
    }
    
    /**
     * 🛑 CLEANUP RESOURCES
     */
    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
                console.log('✅ Browser cleanup completed');
            }
        } catch (error) {
            console.error('❌ Cleanup error:', error);
        }
    }
    
    /**
     * 🔍 COMPREHENSIVE WEB RESEARCH
     */
    async performWebResearch(topic, maxResults = 5) {
        try {
            console.log(`🔍 Performing comprehensive web research on: ${topic}`);
            
            // 1. Search for results
            const searchResults = await this.searchWeb(topic, maxResults);
            
            if (searchResults.length === 0) {
                return {
                    topic,
                    results: [],
                    insights: [],
                    summary: 'No search results found'
                };
            }
            
            // 2. Fetch content from top results
            const contentResults = [];
            for (const result of searchResults.slice(0, 3)) { // Limit to top 3 to avoid rate limits
                try {
                    const content = await this.fetchContent(result.url);
                    const insights = await this.analyzeContentForArbitrageInsights(content);
                    
                    contentResults.push({
                        ...result,
                        content,
                        insights
                    });
                    
                    // Rate limiting delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (error) {
                    console.error(`❌ Failed to fetch content for ${result.url}:`, error);
                }
            }
            
            // 3. Generate summary
            const allInsights = contentResults.flatMap(r => r.insights.insights);
            const avgRelevanceScore = contentResults.length > 0 ?
                contentResults.reduce((sum, r) => sum + r.insights.relevanceScore, 0) / contentResults.length : 0;
            
            return {
                topic,
                searchResults,
                contentResults,
                insights: allInsights,
                relevanceScore: avgRelevanceScore,
                summary: this.generateResearchSummary(contentResults),
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error(`❌ Web research failed for topic "${topic}":`, error);
            return {
                topic,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }
    
    /**
     * 📝 GENERATE RESEARCH SUMMARY
     */
    generateResearchSummary(contentResults) {
        if (contentResults.length === 0) {
            return 'No content could be extracted from search results.';
        }
        
        const totalWords = contentResults.reduce((sum, r) => sum + r.content.wordCount, 0);
        const totalInsights = contentResults.reduce((sum, r) => sum + r.insights.insights.length, 0);
        const avgRelevance = contentResults.reduce((sum, r) => sum + r.insights.relevanceScore, 0) / contentResults.length;
        
        return `Research completed on ${contentResults.length} sources. ` +
               `Total content: ${totalWords} words. ` +
               `Found ${totalInsights} arbitrage-related insights. ` +
               `Average relevance score: ${(avgRelevance * 100).toFixed(1)}%.`;
    }
    
    /**
     * 🧠 INTELLIGENT CONTENT TRIAGE (DECIDE IF LLM ANALYSIS IS WORTH THE COST)
     */
    shouldUseLLMAnalysis(content) {
        // High-value indicators that justify LLM cost
        const highValueKeywords = [
            'flash loan', 'arbitrage', 'mev', 'defi', 'ethereum', 'polygon', 'arbitrum',
            'uniswap', 'sushiswap', 'curve', 'balancer', 'yield farming', 'liquidity mining',
            'smart contract', 'blockchain', 'cryptocurrency', 'trading strategy', 'profit',
            'governance token', 'dao', 'tokenomics', 'bridge', 'layer 2', 'rollup'
        ];
        
        const contentLower = content.text.toLowerCase();
        const keywordMatches = highValueKeywords.filter(keyword => 
            contentLower.includes(keyword)
        ).length;
        
        // Decision criteria
        const isHighValue = (
            keywordMatches >= 3 || // Multiple relevant keywords
            content.text.length > 2000 || // Substantial content
            content.source?.includes('medium.com') || // High-quality platforms
            content.source?.includes('github.com') ||
            content.source?.includes('blog') ||
            content.title?.toLowerCase().includes('arbitrage')
        );
        
        if (isHighValue) {
            console.log(`🧠 High-value content detected (${keywordMatches} keywords) - queuing for LLM analysis`);
        }
        
        return isHighValue;
    }
    
    /**
     * 📦 ADD TO BATCH QUEUE FOR EFFICIENT PROCESSING
     */
    addToBatch(content) {
        this.batchQueue.push({
            content,
            timestamp: Date.now(),
            id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        
        console.log(`📦 Added content to batch queue (${this.batchQueue.length}/${this.maxBatchSize})`);
        
        // Process batch if full or start timer
        if (this.batchQueue.length >= this.maxBatchSize) {
            this.processBatch();
        } else if (this.batchQueue.length === 1) {
            // Start timer for partial batch
            setTimeout(() => {
                if (this.batchQueue.length > 0) {
                    this.processBatch();
                }
            }, this.batchProcessingInterval);
        }
    }
    
    /**
     * 🎯 PROCESS BATCH WITH MULTI-LLM CONSENSUS
     */
    async processBatch() {
        if (this.batchQueue.length === 0) return;
        
        console.log(`🎯 Processing batch of ${this.batchQueue.length} content items with Multi-LLM analysis`);
        
        const batchItems = [...this.batchQueue];
        this.batchQueue = [];
        
        const results = [];
        
        for (const item of batchItems) {
            try {
                // Multi-LLM analysis for consensus
                const analysis = await this.performMultiLLMAnalysis(item.content);
                
                results.push({
                    id: item.id,
                    content: item.content,
                    analysis,
                    processedAt: Date.now()
                });
                
                this.analysisStats.llmAnalyses++;
                this.analysisStats.batchedRequests++;
                
                // Rate limiting between LLM calls
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.error(`❌ LLM analysis failed for ${item.id}:`, error);
                results.push({
                    id: item.id,
                    content: item.content,
                    analysis: { error: error.message },
                    processedAt: Date.now()
                });
            }
        }
        
        // Store results for newsletter integration
        await this.storeBatchResults(results);
        
        console.log(`✅ Batch processing complete: ${results.length} items analyzed`);
        return results;
    }
    
    /**
     * 🧠 MULTI-LLM ANALYSIS WITH CONSENSUS
     */
    async performMultiLLMAnalysis(content) {
        const prompt = this.buildAnalysisPrompt(content);
        const analyses = [];
        
        // Try multiple LLM providers for consensus
        for (const [provider, client] of Object.entries(this.llmClients)) {
            try {
                let response;
                
                switch (provider) {
                    case 'openai':
                        response = await client.chat.completions.create({
                            model: 'gpt-4',
                            messages: [{ role: 'user', content: prompt }],
                            max_tokens: 1000,
                            temperature: 0.3
                        });
                        analyses.push({
                            provider: 'OpenAI GPT-4',
                            analysis: response.choices[0].message.content,
                            cost: 0.03 // Estimated cost
                        });
                        break;
                        
                    case 'anthropic':
                        response = await client.messages.create({
                            model: 'claude-3-sonnet-20240229',
                            max_tokens: 1000,
                            messages: [{ role: 'user', content: prompt }]
                        });
                        analyses.push({
                            provider: 'Anthropic Claude',
                            analysis: response.content[0].text,
                            cost: 0.015 // Estimated cost
                        });
                        break;
                        
                    case 'google':
                        const model = client.getGenerativeModel({ model: 'gemini-pro' });
                        response = await model.generateContent(prompt);
                        analyses.push({
                            provider: 'Google Gemini',
                            analysis: response.response.text(),
                            cost: 0.01 // Estimated cost
                        });
                        break;
                }
                
                // Only use one LLM initially to control costs, expand if needed
                break;
                
            } catch (error) {
                console.error(`❌ ${provider} analysis failed:`, error);
                continue;
            }
        }
        
        if (analyses.length === 0) {
            throw new Error('All LLM providers failed');
        }
        
        // Calculate consensus and extract insights
        const consensus = this.calculateLLMConsensus(analyses);
        
        // Update cost tracking
        const totalCost = analyses.reduce((sum, a) => sum + a.cost, 0);
        this.analysisStats.estimatedCosts += totalCost;
        
        return {
            analyses,
            consensus,
            confidence: analyses.length > 1 ? 0.9 : 0.7,
            totalCost
        };
    }
    
    /**
     * 📝 BUILD ANALYSIS PROMPT FOR LLM
     */
    buildAnalysisPrompt(content) {
        return `
Analyze the following content for DeFi arbitrage and MEV opportunities:

CONTENT:
Title: ${content.title || 'N/A'}
Source: ${content.source || 'N/A'}
Text: ${content.text.substring(0, 3000)}...

ANALYSIS REQUIREMENTS:
1. Identify any arbitrage opportunities, strategies, or insights
2. Extract specific DEX mentions, token pairs, and protocols
3. Note any profitability metrics, gas costs, or timing considerations
4. Highlight novel techniques or alpha information
5. Rate the content's value for arbitrage traders (1-10)

RESPONSE FORMAT:
{
  "arbitrage_insights": ["insight1", "insight2", ...],
  "protocols_mentioned": ["protocol1", "protocol2", ...],
  "opportunities": ["opportunity1", "opportunity2", ...],
  "profitability_data": "any profit/cost data found",
  "value_rating": 7,
  "summary": "brief summary of key findings"
}
`;
    }
    
    /**
     * 🎯 CALCULATE LLM CONSENSUS
     */
    calculateLLMConsensus(analyses) {
        if (analyses.length === 1) {
            return analyses[0].analysis;
        }
        
        // For now, use the first successful analysis
        // TODO: Implement more sophisticated consensus logic
        return analyses[0].analysis;
    }
    
    /**
     * 💾 STORE BATCH RESULTS FOR NEWSLETTER INTEGRATION
     */
    async storeBatchResults(results) {
        try {
            // Store in filesystem for now (can integrate with database later)
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `web_scraper_results_${timestamp}.json`;
            
            const fs = await import('fs');
            const path = await import('path');
            
            const dataDir = path.join(process.cwd(), 'data', 'web-scraper');
            
            // Ensure directory exists
            await fs.promises.mkdir(dataDir, { recursive: true });
            
            const filepath = path.join(dataDir, filename);
            
            // Append to existing file or create new
            let existingData = [];
            try {
                const existing = await fs.promises.readFile(filepath, 'utf8');
                existingData = JSON.parse(existing);
            } catch (err) {
                // File doesn't exist yet
            }
            
            existingData.push(...results);
            
            await fs.promises.writeFile(
                filepath, 
                JSON.stringify(existingData, null, 2),
                'utf8'
            );
            
            console.log(`💾 Stored ${results.length} analysis results to ${filename}`);
            
        } catch (error) {
            console.error('❌ Failed to store batch results:', error);
        }
    }
    
    /**
     * 📊 GET ANALYSIS STATISTICS
     */
    getAnalysisStats() {
        return {
            ...this.analysisStats,
            batchQueueSize: this.batchQueue.length,
            averageCostPerAnalysis: this.analysisStats.llmAnalyses > 0 ? 
                this.analysisStats.estimatedCosts / this.analysisStats.llmAnalyses : 0
        };
    }
}

export default AutonomousWebScraper;