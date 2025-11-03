/**
 * 🔧 RPC PROVIDER AUTHENTICATION FIXES
 * ====================================
 * 
 * FIXES:
 * ❌ QuickNode 401 Unauthorized errors
 * ❌ JsonRpcProvider network detection failures  
 * ❌ Provider timeout and retry logic
 * ❌ Missing API key configurations
 */

// BLOCKCHAIN REMOVED: import { ethers } from 'ethers';

export class FixedRPCProviderManager {
    constructor() {
        this.providers = new Map();
        this.healthCheck = new Map();
        this.retryAttempts = 3;
        this.timeout = 10000; // 10 seconds
        
        this.initializeProviders();
    }

    /**
     * 🔧 INITIALIZE PROVIDERS WITH PROPER AUTHENTICATION
     * =================================================
     */
    initializeProviders() {
        const providers = {
            // PREMIUM TIER - With proper authentication
            alchemy: {
                name: 'Alchemy',
                url: process.env.ALCHEMY_ARBITRUM_URL || `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
                tier: 'premium',
                priority: 1,
                requiresAuth: true
            },
            infura: {
                name: 'Infura',
                url: process.env.INFURA_ARBITRUM_URL || `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
                tier: 'premium',
                priority: 2,
                requiresAuth: true
            },
            quicknode: {
                name: 'QuickNode',
                url: process.env.QUICKNODE_ARBITRUM_URL,
                tier: 'premium', 
                priority: 3,
                requiresAuth: true
            },

            // OFFICIAL TIER
            arbitrum_official: {
                name: 'Arbitrum Official',
                url: 'https://arb1.arbitrum.io/rpc',
                tier: 'official',
                priority: 4,
                requiresAuth: false
            },

            // PUBLIC TIER  
            ankr: {
                name: 'Ankr',
                url: process.env.ANKR_ARBITRUM_URL || 'https://rpc.ankr.com/arbitrum',
                tier: 'public',
                priority: 5,
                requiresAuth: false
            },
            publicnode: {
                name: 'PublicNode',
                url: 'https://arbitrum-one.publicnode.com',
                tier: 'public', 
                priority: 6,
                requiresAuth: false
            },

            // EMERGENCY TIER
            blockpi: {
                name: 'BlockPI',
                url: 'https://arbitrum.blockpi.network/v1/rpc/public',
                tier: 'emergency',
                priority: 7,
                requiresAuth: false
            },
            blastapi: {
                name: 'BlastAPI',
                url: 'https://arbitrum-one.blastapi.io/b8413108-5a1b-4a4c-9e89-2ed2b549a9c9',
                tier: 'emergency',
                priority: 8,
                requiresAuth: false
            }
        };

        // Validate and initialize each provider
        for (const [key, config] of Object.entries(providers)) {
            try {
                // Skip providers without required authentication
                if (config.requiresAuth && !config.url.includes('://')) {
                    console.log(`⚠️ Skipping ${config.name}: Missing API key`);
                    continue;
                }

                // Skip QuickNode if no URL provided (prevents 401 errors)
                if (key === 'quicknode' && !process.env.QUICKNODE_ARBITRUM_URL) {
                    console.log(`⚠️ Skipping QuickNode: No URL provided in environment`);
                    continue;
                }

                const provider = this.createProvider(config);
                if (provider) {
                    this.providers.set(key, { provider, config });
                    this.healthCheck.set(key, { status: 'unknown', lastCheck: 0 });
                }
            } catch (error) {
                console.error(`❌ Failed to initialize ${config.name}:`, error.message);
            }
        }

        console.log(`✅ Initialized ${this.providers.size} RPC providers`);
    }

    /**
     * 🔧 CREATE PROVIDER WITH PROPER ERROR HANDLING
     * =============================================
     */
    createProvider(config) {
        try {
            // Create provider with custom configuration
            const provider = new ethers.JsonRpcProvider(config.url, {
                name: config.name.toLowerCase(),
                chainId: 42161 // Arbitrum One
            }, {
                polling: false, // Disable auto-polling to prevent connection spam
                batchMaxCount: 1, // Prevent batch requests that can cause auth issues
                batchMaxSize: 1024,
                batchStallTime: 10
            });

            // Set custom timeout
            provider._getConnection().timeout = this.timeout;

            // Handle provider errors
            provider.on('error', (error) => {
                console.error(`❌ Provider ${config.name} error:`, error.message);
                this.markProviderUnhealthy(config.name.toLowerCase());
            });

            return provider;

        } catch (error) {
            console.error(`❌ Failed to create ${config.name} provider:`, error.message);
            return null;
        }
    }

    /**
     * 🏥 HEALTH CHECK ALL PROVIDERS
     * =============================
     */
    async healthCheckAll() {
        console.log('🏥 Checking provider health...');
        
        const healthPromises = Array.from(this.providers.entries()).map(async ([key, { provider, config }]) => {
            try {
                const start = Date.now();
                
                // Simple health check - get latest block number
                const blockNumber = await Promise.race([
                    provider.getBlockNumber(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
                ]);
                
                const responseTime = Date.now() - start;
                
                this.healthCheck.set(key, {
                    status: 'healthy',
                    lastCheck: Date.now(),
                    responseTime,
                    blockNumber
                });
                
                console.log(`   ✅ ${config.name}: Block ${blockNumber} (${responseTime}ms)`);
                return { key, status: 'healthy', responseTime };
                
            } catch (error) {
                this.healthCheck.set(key, {
                    status: 'unhealthy',
                    lastCheck: Date.now(),
                    error: error.message
                });
                
                console.log(`   ❌ ${config.name}: ${error.message}`);
                return { key, status: 'unhealthy', error: error.message };
            }
        });

        const results = await Promise.all(healthPromises);
        
        const healthy = results.filter(r => r.status === 'healthy').length;
        const total = results.length;
        
        console.log(`🏥 Health check complete: ${healthy}/${total} providers healthy`);
        
        return results;
    }

    /**
     * 🚀 GET BEST PROVIDER
     * ====================
     * Returns the fastest healthy provider
     */
    async getBestProvider() {
        // Get healthy providers sorted by priority
        const healthyProviders = Array.from(this.providers.entries())
            .filter(([key, _]) => {
                const health = this.healthCheck.get(key);
                return health && health.status === 'healthy';
            })
            .sort((a, b) => a[1].config.priority - b[1].config.priority);

        if (healthyProviders.length === 0) {
            throw new Error('No healthy providers available');
        }

        return healthyProviders[0][1].provider;
    }

    /**
     * 🔄 MAKE RPC CALL WITH RETRY AND FALLBACK
     * ========================================
     */
    async makeRpcCall(method, params = [], contractAddress = null) {
        const providers = Array.from(this.providers.values())
            .sort((a, b) => a.config.priority - b.config.priority);

        let lastError;

        for (const { provider, config } of providers) {
            // Skip unhealthy providers
            const health = this.healthCheck.get(config.name.toLowerCase());
            if (health && health.status === 'unhealthy') {
                continue;
            }

            for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
                try {
                    console.log(`🔧 DEBUG: Making RPC call to ${contractAddress || 'network'} with method ${method} and provider ${config.name}`);
                    
                    let result;
                    if (contractAddress && method !== 'getBlockNumber') {
                        // Contract call
                        const abi = ["function token0() view returns (address)", "function token1() view returns (address)", "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"];
                        const contract = new ethers.Contract(contractAddress, abi, provider);
                        result = await contract[method](...params);
                    } else {
                        // Direct provider call
                        result = await provider[method](...params);
                    }
                    
                    console.log(`🔧 DEBUG: RPC call successful! Result type: ${typeof result}`);
                    
                    // Mark provider as healthy
                    this.healthCheck.set(config.name.toLowerCase(), {
                        status: 'healthy',
                        lastCheck: Date.now()
                    });
                    
                    return result;

                } catch (error) {
                    lastError = error;
                    console.log(`❌ RPC call failed on ${config.name} (attempt ${attempt}/${this.retryAttempts}): ${error.message}`);
                    
                    // Mark provider as unhealthy on auth errors
                    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                        this.markProviderUnhealthy(config.name.toLowerCase());
                        break; // Don't retry auth errors
                    }
                    
                    // Wait before retry
                    if (attempt < this.retryAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }
            }
        }

        throw new Error(`All providers failed. Last error: ${lastError?.message}`);
    }

    /**
     * 💔 MARK PROVIDER UNHEALTHY
     * ==========================
     */
    markProviderUnhealthy(providerKey) {
        this.healthCheck.set(providerKey, {
            status: 'unhealthy',
            lastCheck: Date.now()
        });
    }

    /**
     * 📊 GET PROVIDER STATUS
     * =====================
     */
    getProviderStatus() {
        const status = {
            totalProviders: this.providers.size,
            healthyProviders: 0,
            unhealthyProviders: 0,
            details: {}
        };

        for (const [key, { config }] of this.providers.entries()) {
            const health = this.healthCheck.get(key);
            const isHealthy = health && health.status === 'healthy';
            
            if (isHealthy) {
                status.healthyProviders++;
            } else {
                status.unhealthyProviders++;
            }

            status.details[config.name] = {
                tier: config.tier,
                status: health?.status || 'unknown',
                lastCheck: health?.lastCheck || 0,
                responseTime: health?.responseTime || null,
                error: health?.error || null
            };
        }

        return status;
    }

    /**
     * 🛑 SHUTDOWN
     * ===========
     */
    async shutdown() {
        console.log('🛑 Shutting down RPC provider manager...');
        
        for (const [key, { provider }] of this.providers.entries()) {
            try {
                if (provider && typeof provider.destroy === 'function') {
                    await provider.destroy();
                }
            } catch (error) {
                console.error(`❌ Error shutting down provider ${key}:`, error.message);
            }
        }
        
        this.providers.clear();
        this.healthCheck.clear();
        
        console.log('✅ RPC provider manager shutdown complete');
    }
}

export default FixedRPCProviderManager; 