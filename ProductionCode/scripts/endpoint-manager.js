#!/usr/bin/env node

/**
 * 🚀 Advanced Endpoint Management System
 * 
 * Intelligent RPC endpoint rotation and management for maximum throughput
 * - Infura: 500 calls/sec
 * - Alchemy: 500 calls/sec  
 * - QuickNode: 15 calls/sec (fallback only)
 * 
 * Total capacity: ~1000 calls/second with smart rotation
 */

import EventEmitter from 'events';

export class EndpointManager extends EventEmitter {
    constructor() {
        super();
        
        this.endpoints = this.initializeEndpoints();
        this.usage = new Map(); // Track usage per endpoint
        this.blacklist = new Set(); // Temporarily blacklisted endpoints
        this.lastRotation = Date.now();
        this.totalRequests = 0;
        this.errors = new Map();
        
        // Start monitoring
        this.startMonitoring();
        
        console.log('🚀 Endpoint Manager initialized with', Object.keys(this.endpoints).length, 'endpoint groups');
    }

    initializeEndpoints() {
        return {
            // 🔥 HIGH-THROUGHPUT TIER (500 calls/sec each)
            infura: {
                tier: 'premium',
                rateLimit: 500, // calls per second
                networks: {
                    ethereum: 'https://mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4',
                    polygon: 'https://polygon-mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4',
                    arbitrum: 'https://arbitrum-mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4',
                    base: 'https://base-mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4',
                    optimism: 'https://optimism-mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4',
                    avalanche: 'https://avalanche-mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4',
                    linea: 'https://linea-mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4'
                },
                backup_keys: [
                    '64b3954137524d29940ada2e176a3141',
                    '2ff3ba4c109b449d862a0d9b374aa8a6', 
                    'afd49e2ee70e4cfbb4edaf4bb15e514c',
                    'f10c5a2b9a6141f0ac032d663697ce6d',
                    'a5ecd3523cce482899cd94a4909cb0e3'
                ],
                priority: 1,
                currentUsage: 0,
                lastReset: Date.now()
            },

            alchemy: {
                tier: 'premium', 
                rateLimit: 500, // calls per second
                networks: {
                    ethereum: 'https://eth-mainnet.g.alchemy.com/v2/REbCC-FAc8AJD0WniRPH4R5aRtTCC9up',
                    arbitrum: 'https://arb-mainnet.g.alchemy.com/v2/REbCC-FAc8AJD0WniRPH4R5aRtTCC9up',
                    polygon: 'https://polygon-mainnet.g.alchemy.com/v2/REbCC-FAc8AJD0WniRPH4R5aRtTCC9up',
                    base: 'https://base-mainnet.g.alchemy.com/v2/REbCC-FAc8AJD0WniRPH4R5aRtTCC9up',
                    solana: 'https://solana-mainnet.g.alchemy.com/v2/REbCC-FAc8AJD0WniRPH4R5aRtTCC9up'
                },
                backup_keys: [
                    'pWrUXluNGmortiWN5TrXac8LObkpvMU2'
                ],
                priority: 1,
                currentUsage: 0,
                lastReset: Date.now()
            },

            // 🐌 LOW-THROUGHPUT TIER (15 calls/sec) - FALLBACK ONLY
            quicknode: {
                tier: 'fallback',
                rateLimit: 15, // calls per second
                networks: {
                    arbitrum_1: 'https://virulent-indulgent-yard.arbitrum-mainnet.quiknode.pro/c61b57427482cdc4cdb4d14b5c7a8c682905d5b3',
                    arbitrum_2: 'https://lively-clean-firefly.arbitrum-mainnet.quiknode.pro/c9f445677e8d1a7c109e5905e2520ea60b09a0c3',
                    arbitrum_3: 'https://solemn-dimensional-shape.arbitrum-mainnet.quiknode.pro/f7535ce901d85c4bfb87626975bcc0d584d5da79',
                    arbitrum_4: 'https://alpha-billowing-gadget.arbitrum-mainnet.quiknode.pro/43c3ed8b00f729d45b98d8a86e31baeed5a2698c'
                },
                priority: 3,
                currentUsage: 0,
                lastReset: Date.now()
            }
        };
    }

    /**
     * 🎯 Smart endpoint selection based on load balancing
     */
    async getOptimalEndpoint(network = 'ethereum', preferredTier = 'premium') {
        const now = Date.now();
        
        // Reset usage counters every second
        this.resetUsageCounters(now);
        
        // Get available providers for this network
        const candidates = this.getAvailableProviders(network, preferredTier);
        
        if (candidates.length === 0) {
            throw new Error(`No available endpoints for network: ${network}`);
        }
        
        // Select best endpoint based on current load
        const selected = this.selectBestEndpoint(candidates);
        
        // Track usage
        this.trackUsage(selected);
        
        return {
            url: selected.url,
            provider: selected.provider,
            network: selected.network,
            tier: selected.tier,
            usage: selected.currentUsage,
            limit: selected.rateLimit
        };
    }

    /**
     * 🔄 Get multiple endpoints for parallel processing
     */
    async getParallelEndpoints(network = 'ethereum', count = 3) {
        const endpoints = [];
        const usedProviders = new Set();
        
        for (let i = 0; i < count; i++) {
            try {
                // Try to get different providers for true parallelization
                const candidates = this.getAvailableProviders(network, 'premium')
                    .filter(c => !usedProviders.has(c.provider));
                
                if (candidates.length === 0) break;
                
                const endpoint = this.selectBestEndpoint(candidates);
                endpoints.push({
                    url: endpoint.url,
                    provider: endpoint.provider,
                    network: endpoint.network
                });
                
                usedProviders.add(endpoint.provider);
                this.trackUsage(endpoint);
                
            } catch (error) {
                console.warn(`Could not get endpoint ${i + 1}:`, error.message);
                break;
            }
        }
        
        return endpoints;
    }

    /**
     * 📊 Get available providers for a network
     */
    getAvailableProviders(network, preferredTier = 'premium') {
        const candidates = [];
        const now = Date.now();
        
        for (const [providerName, config] of Object.entries(this.endpoints)) {
            // Skip blacklisted providers
            if (this.blacklist.has(providerName)) continue;
            
            // Check if provider supports this network
            const networkUrl = this.findNetworkUrl(config.networks, network);
            if (!networkUrl) continue;
            
            // Check rate limit
            if (config.currentUsage >= config.rateLimit * 0.9) { // 90% threshold
                continue;
            }
            
            // Prefer premium tier, but allow fallback
            if (preferredTier === 'premium' && config.tier === 'fallback') {
                continue;
            }
            
            candidates.push({
                provider: providerName,
                url: networkUrl,
                network: network,
                tier: config.tier,
                priority: config.priority,
                currentUsage: config.currentUsage,
                rateLimit: config.rateLimit,
                availableCapacity: config.rateLimit - config.currentUsage
            });
        }
        
        return candidates.sort((a, b) => {
            // Sort by: 1) Priority (lower is better), 2) Available capacity (higher is better)
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return b.availableCapacity - a.availableCapacity;
        });
    }

    /**
     * 🎯 Select the best endpoint from candidates
     */
    selectBestEndpoint(candidates) {
        if (candidates.length === 0) {
            throw new Error('No endpoint candidates available');
        }
        
        // Weighted selection based on available capacity
        const totalCapacity = candidates.reduce((sum, c) => sum + c.availableCapacity, 0);
        
        if (totalCapacity === 0) {
            // All near capacity, return the one with lowest usage
            return candidates.reduce((best, current) => 
                current.currentUsage < best.currentUsage ? current : best
            );
        }
        
        // Return the one with most available capacity in premium tier
        return candidates[0];
    }

    /**
     * 🔍 Find network URL in provider config
     */
    findNetworkUrl(networks, targetNetwork) {
        // Direct match
        if (networks[targetNetwork]) {
            return networks[targetNetwork];
        }
        
        // Partial match (e.g. arbitrum matches arbitrum_1)
        for (const [networkKey, url] of Object.entries(networks)) {
            if (networkKey.includes(targetNetwork) || targetNetwork.includes(networkKey)) {
                return url;
            }
        }
        
        return null;
    }

    /**
     * 📈 Track endpoint usage
     */
    trackUsage(endpoint) {
        const config = this.endpoints[endpoint.provider];
        if (config) {
            config.currentUsage++;
            this.totalRequests++;
        }
        
        this.emit('request', {
            provider: endpoint.provider,
            network: endpoint.network,
            usage: config?.currentUsage,
            limit: config?.rateLimit
        });
    }

    /**
     * 🔄 Reset usage counters every second
     */
    resetUsageCounters(now) {
        for (const [providerName, config] of Object.entries(this.endpoints)) {
            // Reset every second
            if (now - config.lastReset >= 1000) {
                config.currentUsage = 0;
                config.lastReset = now;
            }
        }
    }

    /**
     * ⚠️ Handle endpoint errors and blacklisting
     */
    handleError(providerName, error) {
        const errorKey = `${providerName}:${error.code || 'unknown'}`;
        const errorCount = (this.errors.get(errorKey) || 0) + 1;
        this.errors.set(errorKey, errorCount);
        
        // Blacklist after 5 errors in 60 seconds
        if (errorCount >= 5) {
            console.warn(`🚫 Blacklisting ${providerName} for 60 seconds due to repeated errors`);
            this.blacklist.add(providerName);
            
            // Remove from blacklist after 60 seconds
            setTimeout(() => {
                this.blacklist.delete(providerName);
                this.errors.delete(errorKey);
                console.log(`✅ Restored ${providerName} to active pool`);
            }, 60000);
        }
        
        // Only emit error if there are listeners to avoid unhandled error events
        if (this.listenerCount('error') > 0) {
            this.emit('error', {
                provider: providerName,
                error: error.message,
                count: errorCount
            });
        } else {
            // Log error instead of emitting
            console.warn(`⚠️ ${providerName} error (${errorCount}):`, error.message);
        }
    }

    /**
     * 📊 Get system status
     */
    getStatus() {
        const now = Date.now();
        const status = {
            totalRequests: this.totalRequests,
            timestamp: now,
            providers: {},
            blacklisted: Array.from(this.blacklist),
            totalCapacity: 0,
            usedCapacity: 0
        };
        
        for (const [name, config] of Object.entries(this.endpoints)) {
            status.providers[name] = {
                tier: config.tier,
                rateLimit: config.rateLimit,
                currentUsage: config.currentUsage,
                utilization: (config.currentUsage / config.rateLimit * 100).toFixed(1) + '%',
                networks: Object.keys(config.networks),
                blacklisted: this.blacklist.has(name)
            };
            
            status.totalCapacity += config.rateLimit;
            status.usedCapacity += config.currentUsage;
        }
        
        status.systemUtilization = (status.usedCapacity / status.totalCapacity * 100).toFixed(1) + '%';
        
        return status;
    }

    /**
     * 🔧 Start monitoring system
     */
    startMonitoring() {
        // Log status every 30 seconds
        setInterval(() => {
            const status = this.getStatus();
            console.log(`\n📊 Endpoint Manager Status:`);
            console.log(`   Total Requests: ${status.totalRequests}`);
            console.log(`   System Utilization: ${status.systemUtilization}`);
            console.log(`   Active Providers: ${Object.keys(status.providers).length - status.blacklisted.length}`);
            
            if (status.blacklisted.length > 0) {
                console.log(`   🚫 Blacklisted: ${status.blacklisted.join(', ')}`);
            }
        }, 30000);
        
        // Clean old error counts every 5 minutes
        setInterval(() => {
            this.errors.clear();
        }, 300000);
    }

    /**
     * 🎯 Specialized methods for different data types
     */
    
    // For price feeds (high frequency)
    async getPriceFeedEndpoint(network = 'ethereum') {
        return this.getOptimalEndpoint(network, 'premium');
    }
    
    // For pool data (medium frequency) 
    async getPoolDataEndpoint(network = 'ethereum') {
        return this.getOptimalEndpoint(network, 'premium');
    }
    
    // For historical data (batch processing)
    async getHistoricalDataEndpoints(network = 'ethereum', count = 5) {
        return this.getParallelEndpoints(network, count);
    }
    
    // For gas tracking (high frequency)
    async getGasTrackingEndpoint(network = 'ethereum') {
        return this.getOptimalEndpoint(network, 'premium');
    }
}

/**
 * 🌐 Network-specific API endpoints for market data
 */
export class MarketDataManager {
    constructor() {
        this.apis = {
            coingecko: {
                key: 'CG-VQMLBAqPw4F3v1JyS48HjQdh',
                baseUrl: 'https://api.coingecko.com/api/v3',
                rateLimit: 30, // calls per minute for free tier
                pro: false
            },
            
            birdeye: {
                key: '94e4e5b160784c11b8389fc16fe78c59',
                baseUrl: 'https://public-api.birdeye.so',
                rateLimit: 100, // calls per minute
                priority: 1
            },
            
            moralis: {
                key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjFiY2M4ZDg1LTUwMTAtNGNiZi1iNzU4LWJhZTM5ZTE4OTE4ZiIsIm9yZ0lkIjoiMzg0MDE1IiwidXNlcklkIjoiMzk0NTc4IiwidHlwZUlkIjoiMzEwMzhkMjItZTg4NS00N2FkLTllNjMtODQwNmQ3NTdhNGYxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTEwMjk0MTYsImV4cCI6NDg2Njc4OTQxNn0.9un3GBdrCb4AlUDfP9bsckyt5Ztusbp35iQx0Bmdleo',
                baseUrl: 'https://deep-index.moralis.io/api/v2',
                rateLimit: 25, // calls per second
                priority: 2
            },
            
            binance: {
                key: 'ogfVIyEX5S04ZAOtzDDXDAI4tDteczlS5T9v4bjx0KkkbAyyqKCG0LR9OTn3D0V6',
                baseUrl: 'https://api.binance.com/api/v3',
                rateLimit: 1200, // calls per minute
                priority: 1
            }
        };
        
        this.usage = new Map();
        this.startUsageTracking();
    }
    
    async getMarketDataEndpoint(preferredApi = 'birdeye') {
        const api = this.apis[preferredApi];
        if (!api) {
            throw new Error(`Unknown API: ${preferredApi}`);
        }
        
        // Check rate limits
        const currentUsage = this.usage.get(preferredApi) || 0;
        if (currentUsage >= api.rateLimit * 0.9) {
            // Find alternative
            const alternatives = Object.entries(this.apis)
                .filter(([name, config]) => name !== preferredApi)
                .sort((a, b) => a[1].priority - b[1].priority);
                
            for (const [altName, altConfig] of alternatives) {
                const altUsage = this.usage.get(altName) || 0;
                if (altUsage < altConfig.rateLimit * 0.9) {
                    return this.buildApiConfig(altName, altConfig);
                }
            }
            
            throw new Error('All market data APIs at capacity');
        }
        
        return this.buildApiConfig(preferredApi, api);
    }
    
    buildApiConfig(name, config) {
        return {
            name,
            baseUrl: config.baseUrl,
            headers: {
                'X-API-KEY': config.key,
                'Content-Type': 'application/json'
            },
            rateLimit: config.rateLimit,
            currentUsage: this.usage.get(name) || 0
        };
    }
    
    trackUsage(apiName) {
        const current = this.usage.get(apiName) || 0;
        this.usage.set(apiName, current + 1);
    }
    
    startUsageTracking() {
        // Reset usage counters every minute
        setInterval(() => {
            this.usage.clear();
        }, 60000);
    }
}

// Export singleton instances
export const endpointManager = new EndpointManager();
export const marketDataManager = new MarketDataManager();

export default { EndpointManager, MarketDataManager, endpointManager, marketDataManager }; 