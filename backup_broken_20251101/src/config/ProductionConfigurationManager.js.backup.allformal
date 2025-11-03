/**
 * 🏭 PRODUCTION CONFIGURATION MANAGER
 * ===================================
 * 
 * CRITICAL FIX: Properly constructs complete configuration from environment variables
 * Solves the database connection and API integration blocking issues.
 * 
 * ✅ Builds DATABASE_URL from individual PostgreSQL env vars
 * ✅ Handles password spaces and authentication issues  
 * ✅ Creates complete config object for UltimateArbitrageSyndicateFactory
 * ✅ Integrates all real API keys from environment
 * ✅ NO MOCK DATA - 100% production configuration
 */

import dotenv from 'dotenv';
import { EventEmitter } from 'events';

// Load environment variables
dotenv.config();

export class ProductionConfigurationManager extends EventEmitter {
    constructor() {
        super();
        this.config = null;
        this.isValidated = false;
    }

    /**
     * 🔧 BUILD COMPLETE PRODUCTION CONFIGURATION
     */
    async buildProductionConfiguration() {
        console.log('🔧 Building complete production configuration...');
        
        try {
            // 🗄️ BUILD DATABASE CONFIGURATION
            const databaseConfig = this.buildDatabaseConfiguration();
            
            // 🔑 BUILD API CONFIGURATION  
            const apiConfig = this.buildAPIConfiguration();
            
            // 🔗 BUILD BLOCKCHAIN CONFIGURATION
            const blockchainConfig = this.buildBlockchainConfiguration();
            
            // 🎯 BUILD OPERATIONAL CONFIGURATION
            const operationalConfig = this.buildOperationalConfiguration();
            
            // 🌐 BUILD COMPLETE SYNDICATE CONFIGURATION
            this.config = {
                // Database settings
                database: databaseConfig,
                
                // API integrations
                apis: apiConfig,
                
                // Blockchain providers
                blockchain: blockchainConfig,
                
                // Operational settings
                ...operationalConfig,
                
                // Meta configuration
                configurationLevel: 'PRODUCTION_GRADE',
                sophistication: 'TOP_1_PERCENT_EXPERT',
                truthRulesEnforced: true,
                noMockData: true,
                realAPIKeysOnly: true
            };
            
            // 🔍 VALIDATE COMPLETE CONFIGURATION
            const validationResult = await this.validateConfiguration();
            
            if (!validationResult.isValid) {
                throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
            }
            
            this.isValidated = true;
            
            console.log('✅ Production configuration built successfully');
            console.log(`📊 Database: ${databaseConfig.connectionString.split('@')[1]}`);
            console.log(`🔑 APIs: ${Object.keys(apiConfig).length} integrations configured`);
            console.log(`⛓️ Blockchain: ${Object.keys(blockchainConfig.rpcUrls).length} chains configured`);
            
            this.emit('configurationBuilt', this.config);
            
            return this.config;
            
        } catch (error) {
            console.error('❌ Failed to build production configuration:', error);
            throw error;
        }
    }
    
    /**
     * 🗄️ BUILD DATABASE CONFIGURATION FROM ENV VARS
     */
    buildDatabaseConfiguration() {
        console.log('   🗄️ Building database configuration...');
        
        // Extract individual PostgreSQL components
        const host = process.env.POSTGRES_HOST || 'localhost';
        const port = process.env.POSTGRES_PORT || '5432';
        const database = process.env.POSTGRES_DB || 'construction_syndicate';
        const user = process.env.POSTGRES_USER || 'postgres';
        const password = (process.env.POSTGRES_PASSWORD || 'postgres').trim(); // Remove any spaces!
        
        // Build proper connection string
        const connectionString = process.env.DATABASE_URL || 
            `postgresql://${user}:${password}@${host}:${port}/${database}`;
        
        console.log(`     Database URL: postgresql://${user}:[HIDDEN]@${host}:${port}/${database}`);
        
        return {
            connectionString,
            host,
            port: parseInt(port),
            database,
            user,
            password,
            maxConnections: 20,
            idleTimeoutMs: 30000,
            connectionTimeoutMs: 5000,
            ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false
        };
    }
    
    /**
     * 🔑 BUILD API CONFIGURATION FROM ENV VARS
     */
    buildAPIConfiguration() {
        console.log('   🔑 Building API configuration...');
        
        return {
            // CoinGecko API
            coinGeckoApiKey: process.env.COINGECKO_API_KEY || process.env.COINGECKO_PRO_API_KEY,
            
            // Alchemy API
            alchemyApiKey: process.env.ALCHEMY_API_KEY,
            alchemyApiKey2: process.env.ALCHEMY_API_KEY_2,
            
            // Infura API
            infuraApiKey: process.env.INFURA_API_KEY,
            infuraApiSecret: process.env.INFURA_API_SECRET,
            
            // Moralis API
            moralisApiKey: process.env.MORALIS_API_KEY,
            
            // Birdeye API
            birdeyeApiKey: process.env.BIRDEYE_API_KEY,
            
            // 0x Protocol API
            zeroExApiKey: process.env.ZERO_EX_API_KEY,
            
            // CoinMarketCap API
            coinmarketcapApiKey: process.env.COINMARKETCAP_API_KEY,
            
            // Messari API
            messariApiKey: process.env.MESSARI_API_KEY,
            
            // QuickNode API
            quicknodeApiKey: process.env.QUICKNODE_API_KEY,
            
            // Chainbase API
            chainbaseApiKey: process.env.CHAINBASE_API_KEY,
            
            // CryptoAPIs
            cryptoapisApiKey: process.env.CRYPTOAPIS_API_KEY,
            
            // Polygon.io for real-time market data
            polygonIoApiKey: process.env.PolygonIO_API_Key,
            polygonIoApiKey2: process.env.PolygonIO_API_Key2,
            
            // Token Metrics
            tokenMetricsApiKey: process.env.TokenMetrics_API_KEY,
            
            // Configuration meta
            realAPIsOnly: true,
            noMockData: true,
            productionGrade: true
        };
    }
    
    /**
     * ⛓️ BUILD BLOCKCHAIN CONFIGURATION FROM ENV VARS
     */
    buildBlockchainConfiguration() {
        console.log('   ⛓️ Building blockchain configuration...');
        
        return {
            // Primary RPC URLs (Alchemy)
            rpcUrls: {
                ethereum: process.env.ETHEREUM_RPC_URL || process.env.ALCHEMY_ETHEREUM_URL,
                arbitrum: process.env.ARBITRUM_RPC_URL || process.env.ALCHEMY_ARBITRUM_URL,
                base: process.env.BASE_RPC_URL || process.env.ALCHEMY_BASE_URL,
                polygon: process.env.POLYGON_RPC_URL || process.env.ALCHEMY_POLYGON_URL,
                optimism: process.env.OPTIMISM_RPC_URL || process.env.ALCHEMY_OPTIMISM_URL,
                bsc: process.env.BNB_RPC_URL || process.env.BSC_PROVIDER_URL
            },
            
            // Backup RPC URLs (Infura)
            backupRpcUrls: {
                ethereum: process.env.ETHEREUM_RPC_URL2 || process.env.INFURA_ETHEREUM_MAINNET,
                arbitrum: process.env.ARBITRUM_RPC_URL2 || process.env.INFURA_ARBITRUM_MAINNET,
                base: process.env.BASE_RPC_URL2 || process.env.INFURA_BASE_MAINNET,
                polygon: process.env.POLYGON_RPC_URL2 || process.env.INFURA_POLYGON_MAINNET,
                optimism: process.env.OPTIMISM_RPC_URL2 || process.env.INFURA_OPTIMISM_SEPOLIA,
                bsc: process.env.BNB_RPC_URL2 || process.env.INFURA_BSC_RPC_URL
            },
            
            // QuickNode endpoints for high-performance operations
            quicknodeUrls: {
                arbitrum: {
                    http: process.env.QUICKNODE_ARBITRUM_URL,
                    ws: process.env.QUICKNODE_ARBITRUM_WSS,
                    backup1: {
                        http: process.env.QUICKNODE_ARBITRUM_URL_2,
                        ws: process.env.QUICKNODE_ARBITRUM_WSS_2
                    },
                    backup2: {
                        http: process.env.QUICKNODE_ARBITRUM_URL_3,
                        ws: process.env.QUICKNODE_ARBITRUM_WSS_3
                    },
                    backup3: {
                        http: process.env.QUICKNODE_ARBITRUM_URL_4,
                        ws: process.env.QUICKNODE_ARBITRUM_WSS_4
                    }
                }
            },
            
            // Wallet configuration
            privateKey: process.env.ARBITRAGE_PRIVATE_KEY || process.env.EVM_PRIVATE_KEY,
            executorAddress: process.env.EVM_ADDRESS,
            
            // Trading configuration
            minProfitUSD: 50,
            maxGasPrice: 20,
            slippageTolerance: 0.005,
            forkEnabled: process.env.NODE_ENV === 'development',
            safetyChecks: true,
            
            // Production settings
            productionMode: true,
            realBlockchainOnly: true
        };
    }
    
    /**
     * 🎯 BUILD OPERATIONAL CONFIGURATION
     */
    buildOperationalConfiguration() {
        console.log('   🎯 Building operational configuration...');
        
        return {
            // Environment settings
            environment: process.env.NODE_ENV || 'development',
            syndicateMode: process.env.SYNDICATE_MODE || 'pretraining',
            enableProduction: process.env.ENABLE_PRODUCTION === 'true',
            
            // Character files
            charactersDir: './characters/ConstructionCharacters',
            teamLeadersDir: './characters/team-leaders',
            llmAgentCharacterFile: 'llm-mastermind.character.json',
            
            // Performance settings
            maxResponseTimeMs: 1400,
            targetSuccessRate: 0.85,
            autosaveEnabled: true,
            autosaveFrequencyMs: 60000, // 1 minute
            
            // Learning settings
            enableLearning: true,
            learningIntensity: 'maximum',
            enablePersistentMemory: true,
            enableWorldModelTraining: true,
            
            // Safety settings
            enableCircuitBreakers: true,
            enableCognitiveCliffProtection: true,
            complexityCliffThreshold: 0.85,
            complexityWarningThreshold: 0.70,
            maxArbitrageHops: 7,
            
            // Monitoring settings
            enableMoralisStreams: true,
            enableBackgroundTasks: true,
            enableWebInterface: true,
            
            // Production requirements
            enforceRealDataOnly: true,
            prohibitMockData: true,
            requireProductionAPIs: true
        };
    }
    
    /**
     * 🔍 VALIDATE COMPLETE CONFIGURATION
     */
    async validateConfiguration() {
        console.log('🔍 Validating complete configuration...');
        
        const errors = [];
        const warnings = [];
        
        // Validate database configuration
        if (!this.config.database.connectionString) {
            errors.push('Database connection string missing');
        }
        
        // Test database connection
        try {
            const { Pool } = await import('pg');
            const testPool = new Pool({
                connectionString: this.config.database.connectionString,
                max: 1,
                connectionTimeoutMillis: 5000
            });
            
            const testClient = await testPool.connect();
            await testClient.query('SELECT NOW()');
            testClient.release();
            await testPool.end();
            
            console.log('     ✅ Database connection validated');
            
        } catch (dbError) {
            errors.push(`Database connection failed: ${dbError.message}`);
        }
        
        // Validate critical API keys
        const criticalApis = ['coinGeckoApiKey', 'alchemyApiKey', 'moralisApiKey'];
        for (const apiKey of criticalApis) {
            if (!this.config.apis[apiKey] || this.config.apis[apiKey].includes('demo-')) {
                warnings.push(`${apiKey} is missing or using demo key`);
            }
        }
        
        // Validate blockchain RPCs
        const criticalChains = ['ethereum', 'arbitrum', 'base', 'polygon'];
        for (const chain of criticalChains) {
            if (!this.config.blockchain.rpcUrls[chain]) {
                errors.push(`${chain} RPC URL missing`);
            }
        }
        
        // Validate wallet configuration
        if (!this.config.blockchain.privateKey) {
            warnings.push('Trading private key not configured - execution will be limited');
        }
        
        console.log(`🔍 Validation complete: ${errors.length} errors, ${warnings.length} warnings`);
        
        if (warnings.length > 0) {
            console.warn('⚠️ Configuration warnings:');
            warnings.forEach(warning => console.warn(`   - ${warning}`));
        }
        
        if (errors.length > 0) {
            console.error('❌ Configuration errors:');
            errors.forEach(error => console.error(`   - ${error}`));
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            configurationHealth: {
                databaseReady: errors.filter(e => e.includes('Database')).length === 0,
                apisReady: this.config.apis.coinGeckoApiKey && this.config.apis.alchemyApiKey,
                blockchainReady: Object.keys(this.config.blockchain.rpcUrls).length >= 4,
                walletReady: !!this.config.blockchain.privateKey
            }
        };
    }
    
    /**
     * 🌐 GET CONFIGURATION FOR SYNDICATE FACTORY
     */
    getFactoryConfiguration() {
        if (!this.isValidated) {
            throw new Error('Configuration not validated. Call buildProductionConfiguration() first.');
        }
        
        return this.config;
    }
    
    /**
     * 📊 GET CONFIGURATION STATUS
     */
    getConfigurationStatus() {
        return {
            isBuilt: !!this.config,
            isValidated: this.isValidated,
            configuration: this.config ? {
                databaseConfigured: !!this.config.database.connectionString,
                apiKeysConfigured: Object.keys(this.config.apis).length,
                blockchainChainsConfigured: Object.keys(this.config.blockchain.rpcUrls).length,
                productionMode: this.config.enforceRealDataOnly
            } : null
        };
    }
}

/**
 * 🚀 CREATE PRODUCTION CONFIGURATION INSTANCE
 */
export async function createProductionConfiguration() {
    const configManager = new ProductionConfigurationManager();
    const config = await configManager.buildProductionConfiguration();
    return config;
}
