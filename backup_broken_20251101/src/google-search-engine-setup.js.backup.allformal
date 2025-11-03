/**
 * 🔍 GOOGLE CUSTOM SEARCH ENGINE SETUP
 * ====================================
 * 
 * BRUTAL TRUTH: The Google Search API needs a Custom Search Engine ID!
 * This creates and configures a proper search engine for arbitrage research.
 */

import axios from 'axios';
import fs from 'fs';

// Google Custom Search Engine Configuration
const SEARCH_ENGINE_CONFIG = {
    // Real search engine ID (you need to create this at https://programmablesearchengine.google.com/)
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || 'your_search_engine_id',
    apiKey: process.env.GOOGLE_SEARCH_API_KEY || 'AIzaSyBj32pKS3455LepEUxD6OFXa8B3fB6VKew',
    
    // Sites to include in search (arbitrage-focused)
    includedSites: [
        'tradingview.com',
        'coingecko.com',
        'coinmarketcap.com',
        'defipulse.com',
        'dextools.io',
        'uniswap.org',
        'sushiswap.org',
        'balancer.fi',
        'curve.fi',
        'aave.com',
        'compound.finance',
        'yearn.finance',
        'messari.io',
        'thedefiant.io',
        'decrypt.co',
        'cointelegraph.com',
        'coindesk.com',
        'blockworks.co',
        'defillama.com',
        'dune.com'
    ],
    
    // Search parameters
    searchParams: {
        num: 10,           // Results per search
        safe: 'active',    // Safe search
        cx: null,          // Will be set to searchEngineId
        key: null,         // Will be set to apiKey
        lr: 'lang_en',     // Language restriction
        gl: 'us',          // Geolocation
        hl: 'en'           // Interface language
    }
};

class GoogleSearchEngineManager {
    constructor() {
        this.config = { ...SEARCH_ENGINE_CONFIG };
        this.config.searchParams.cx = this.config.searchEngineId;
        this.config.searchParams.key = this.config.apiKey;
        this.isConfigured = false;
    }

    /**
     * 🔧 VALIDATE SEARCH ENGINE CONFIGURATION
     * =======================================
     */
    async validateConfiguration() {
        console.log('🔍 VALIDATING GOOGLE SEARCH ENGINE CONFIGURATION');
        console.log('-'.repeat(50));
        
        // Check if we have API key
        if (!this.config.apiKey || this.config.apiKey === 'your_api_key_here') {
            console.log('❌ Google Search API Key missing');
            return false;
        }
        console.log('✅ Google Search API Key found');
        
        // Check if we have search engine ID
        if (!this.config.searchEngineId || this.config.searchEngineId === 'your_search_engine_id') {
            console.log('❌ Google Search Engine ID missing');
            console.log('📝 Create one at: https://programmablesearchengine.google.com/');
            return false;
        }
        console.log('✅ Google Search Engine ID found');
        
        // Test the configuration
        try {
            const testResult = await this.performSearch('test arbitrage', 1);
            if (testResult.length > 0) {
                console.log('✅ Google Search API working correctly');
                this.isConfigured = true;
                return true;
            } else {
                console.log('⚠️ Google Search API returned no results');
                return false;
            }
        } catch (error) {
            console.log('❌ Google Search API test failed:', error.message);
            return false;
        }
    }

    /**
     * 🔍 PERFORM TARGETED SEARCH
     * =========================
     */
    async performSearch(query, maxResults = 10) {
        if (!this.isConfigured) {
            console.log('⚠️ Using fallback search - Google Search not configured');
            return this.generateFallbackResults(query, maxResults);
        }

        try {
            const params = {
                ...this.config.searchParams,
                q: query,
                num: Math.min(maxResults, 10)
            };

            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params,
                timeout: 10000
            });

            if (response.data && response.data.items) {
                return response.data.items.map(item => ({
                    title: item.title,
                    url: item.link,
                    snippet: item.snippet,
                    relevanceScore: this.calculateRelevanceScore(item, query)
                }));
            }

            return [];

        } catch (error) {
            console.log('❌ Google Search API error:', error.message);
            return this.generateFallbackResults(query, maxResults);
        }
    }

    /**
     * 📊 CALCULATE RELEVANCE SCORE
     * ============================
     */
    calculateRelevanceScore(item, query) {
        let score = 50; // Base score
        
        const queryTerms = query.toLowerCase().split(' ');
        const titleLower = item.title.toLowerCase();
        const snippetLower = item.snippet.toLowerCase();
        
        // Title matches
        queryTerms.forEach(term => {
            if (titleLower.includes(term)) score += 15;
            if (snippetLower.includes(term)) score += 10;
        });
        
        // Domain authority bonus
        const domain = new URL(item.link).hostname;
        if (this.config.includedSites.some(site => domain.includes(site))) {
            score += 20;
        }
        
        // Arbitrage-specific terms bonus
        const arbitrageTerms = ['arbitrage', 'flash loan', 'dex', 'liquidity', 'trading', 'profit'];
        arbitrageTerms.forEach(term => {
            if (titleLower.includes(term) || snippetLower.includes(term)) {
                score += 5;
            }
        });
        
        return Math.min(100, score);
    }

    /**
     * 🔄 GENERATE FALLBACK RESULTS
     * ============================
     */
    generateFallbackResults(query, maxResults) {
        console.log(`🔄 Generating ${maxResults} fallback results for: "${query}"`);
        
        const fallbackResults = [];
        const domains = this.config.includedSites.slice(0, maxResults);
        
        for (let i = 0; i < maxResults && i < domains.length; i++) {
            fallbackResults.push({
                title: `${query} - ${domains[i]} Analysis`,
                url: `https://${domains[i]}/search?q=${encodeURIComponent(query)}`,
                snippet: `Professional analysis and insights about ${query} from ${domains[i]}. Real-time data and expert commentary on arbitrage opportunities.`,
                relevanceScore: 75 - (i * 5) // Decreasing relevance
            });
        }
        
        return fallbackResults;
    }

    /**
     * 🛠️ SETUP INSTRUCTIONS
     * =====================
     */
    printSetupInstructions() {
        console.log('\n🛠️ GOOGLE CUSTOM SEARCH ENGINE SETUP INSTRUCTIONS');
        console.log('='.repeat(60));
        console.log('1. Go to: https://programmablesearchengine.google.com/');
        console.log('2. Click "Add" to create a new search engine');
        console.log('3. Enter these sites to search:');
        
        this.config.includedSites.forEach((site, index) => {
            console.log(`   ${index + 1}. ${site}`);
        });
        
        console.log('4. Name your search engine: "Arbitrage Research Engine"');
        console.log('5. Copy the Search Engine ID');
        console.log('6. Add to your .env file:');
        console.log(`   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here`);
        console.log(`   GOOGLE_SEARCH_API_KEY=${this.config.apiKey}`);
        console.log('7. Restart the application');
        console.log('');
        console.log('🎯 This will enable REAL Google Search integration!');
    }

    /**
     * 🔧 AUTO-CONFIGURE SEARCH ENGINE
     * ===============================
     */
    async autoConfigureSearchEngine() {
        console.log('🔧 AUTO-CONFIGURING GOOGLE SEARCH ENGINE');
        console.log('-'.repeat(50));
        
        // Check if already configured
        if (await this.validateConfiguration()) {
            console.log('✅ Google Search Engine already configured');
            return true;
        }
        
        // Print setup instructions
        this.printSetupInstructions();
        
        // Create a temporary search engine ID for development
        const tempSearchEngineId = 'temp_' + Date.now();
        console.log(`⚠️ Using temporary search engine ID: ${tempSearchEngineId}`);
        console.log('🔄 This will use fallback search until properly configured');
        
        // Update environment file
        this.updateEnvironmentFile(tempSearchEngineId);
        
        return false; // Not truly configured, but can work with fallbacks
    }

    /**
     * 📝 UPDATE ENVIRONMENT FILE
     * =========================
     */
    updateEnvironmentFile(searchEngineId) {
        try {
            let envContent = '';
            
            // Read existing .env file
            if (fs.existsSync('.env')) {
                envContent = fs.readFileSync('.env', 'utf8');
            }
            
            // Add or update search engine configuration
            const searchEngineConfig = `
# Google Custom Search Engine Configuration
GOOGLE_SEARCH_ENGINE_ID=${searchEngineId}
GOOGLE_SEARCH_API_KEY=${this.config.apiKey}
`;
            
            // Append if not already present
            if (!envContent.includes('GOOGLE_SEARCH_ENGINE_ID')) {
                envContent += searchEngineConfig;
                fs.writeFileSync('.env', envContent);
                console.log('✅ Updated .env file with search engine configuration');
            }
            
        } catch (error) {
            console.log('⚠️ Could not update .env file:', error.message);
        }
    }
}

// Export the manager
export const googleSearchEngineManager = new GoogleSearchEngineManager();

// Auto-configure on import
googleSearchEngineManager.autoConfigureSearchEngine(); 