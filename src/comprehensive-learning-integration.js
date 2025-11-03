import { EventEmitter } from 'events';
import pkg from 'pg';
const { Pool } = pkg;
import { AggressiveLearningTrainer } from './aggressive-learning-trainer.js';
import { getDatabaseUrl, logDatabaseConfig } from './database-config-helper.js';

console.log('🔗 COMPREHENSIVE LEARNING INTEGRATION');
console.log('====================================');

/**
 * 🧠 COMPREHENSIVE LEARNING INTEGRATION
 * ====================================
 * 
 * This system bridges the aggressive learning trainer with:
 * ✅ Real database integration
 * ✅ Pool price monitoring
 * ✅ Learning state persistence
 * ✅ Performance tracking
 * 
 * BRUTAL TRUTH: This connects everything together!
 */
class ComprehensiveLearningIntegration extends EventEmitter {
    constructor() {
        super();
        
        // Database connection with optimized settings to prevent overload
        this.dbPool = new Pool({
            connectionString: getDatabaseUrl(),
            max: 5, // Reduced from 20 to prevent overload
            min: 1, // Keep minimum connections
            idleTimeoutMillis: 60000, // Increased idle timeout
            connectionTimeoutMillis: 5000, // Increased connection timeout
            acquireTimeoutMillis: 10000, // Add acquire timeout
            createTimeoutMillis: 3000, // Add create timeout
            destroyTimeoutMillis: 5000, // Add destroy timeout
            reapIntervalMillis: 1000, // Check for idle connections every second
            createRetryIntervalMillis: 200, // Retry interval for failed connections
        });
        
        // Monitor database pool health
        this.dbPool.on('error', (err) => {
            console.error('❌ Database pool error:', err.message);
        });
        
        this.dbPool.on('connect', () => {
            console.log('🔗 Database client connected');
        });
        
        this.dbPool.on('remove', () => {
            console.log('📤 Database client removed from pool');
        });
        
        // Learning components
        this.aggressiveLearner = new AggressiveLearningTrainer();
        
        // Learning state
        this.learningState = {
            isActive: false,
            sessionStartTime: null,
            totalOpportunities: 0,
            successfulOpportunities: 0,
            totalProfit: 0,
            learningCycles: 0,
            strategiesEvaluated: new Set(),
            performanceHistory: [],
            realArbitrageData: []
        };
        
        // Bind event handlers
        this.setupEventHandlers();
    }

    /**
     * 🚀 START COMPREHENSIVE LEARNING
     * ===============================
     */
    async startComprehensiveLearning() {
        console.log('🧠 STARTING COMPREHENSIVE LEARNING INTEGRATION');
        console.log('='.repeat(60));
        
        // Log database configuration
        logDatabaseConfig();
        
        // Test database connection
        await this.testDatabaseConnection();
        
        // Initialize learning state
        this.learningState.isActive = true;
        this.learningState.sessionStartTime = Date.now();
        
        // Start aggressive learning trainer
        await this.aggressiveLearner.startAggressiveLearning();
        
        // Start real arbitrage data collection
        this.startRealArbitrageDataCollection();
        
        // Start learning performance monitoring
        this.startLearningPerformanceMonitoring();
        
        console.log('✅ Comprehensive learning integration ACTIVE!');
        
        return this.getLearningStatus();
    }

    /**
     * 🔗 SETUP EVENT HANDLERS
     * =======================
     */
    setupEventHandlers() {
        // Handle new opportunities from aggressive learner
        this.aggressiveLearner.on('newOpportunities', async (data) => {
            await this.processNewOpportunities(data);
        });
        
        // Handle strategy evaluations
        this.aggressiveLearner.on('strategyEvaluation', async (data) => {
            await this.processStrategyEvaluation(data);
        });
        
        // Handle performance reviews
        this.aggressiveLearner.on('performanceReview', async (data) => {
            await this.processPerformanceReview(data);
        });
        
        // Handle opportunity switches
        this.aggressiveLearner.on('opportunitySwitch', async (data) => {
            await this.processOpportunitySwitch(data);
        });
    }

    /**
     * 🗃️ TEST DATABASE CONNECTION
     * ===========================
     */
    async testDatabaseConnection() {
        try {
            console.log('🔍 Testing database connection...');
            
            const client = await this.dbPool.connect();
            
            // Test basic query
            const result = await client.query('SELECT NOW() as current_time');
            console.log(`✅ Database connected: ${result.rows[0].current_time}`);
            
            // Check if our tables exist
            const tablesResult = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('pools', 'current_pool_prices', 'pool_price_history', 'swap_events')
            `);
            
            console.log(`📊 Available tables: ${tablesResult.rows.map(r => r.table_name).join(', ')}`);
            
            client.release();
            
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    /**
     * 📊 START REAL ARBITRAGE DATA COLLECTION
     * =======================================
     */
    startRealArbitrageDataCollection() {
        console.log('📊 Starting real arbitrage data collection...');
        
        // Collect real pool data every 2 minutes (reduced frequency)
        setInterval(async () => {
            await this.collectRealPoolData();
        }, 120000);
        
        // Monitor price deltas every 1 minute (reduced frequency)
        setInterval(async () => {
            await this.monitorPriceDeltas();
        }, 60000);
    }

    /**
     * 📈 START LEARNING PERFORMANCE MONITORING
     * ========================================
     */
    startLearningPerformanceMonitoring() {
        console.log('📈 Starting learning performance monitoring...');
        
        // Monitor performance every 2 minutes
        setInterval(async () => {
            await this.monitorLearningPerformance();
        }, 120000);
        
        // Save learning state every 5 minutes
        setInterval(async () => {
            await this.saveLearningState();
        }, 300000);
    }

    /**
     * 🎯 PROCESS NEW OPPORTUNITIES
     * ============================
     */
    async processNewOpportunities(data) {
        console.log(`🎯 Processing ${data.opportunities.length} new opportunities from ${data.strategy}`);
        
        for (const opportunity of data.opportunities) {
            // Simulate opportunity execution with real data
            const result = await this.executeOpportunityWithRealData(opportunity);
            
            // Record result in aggressive learner
            this.aggressiveLearner.recordOpportunityResult(opportunity.id, result);
            
            // Update learning state
            this.learningState.totalOpportunities++;
            if (result.success) {
                this.learningState.successfulOpportunities++;
                this.learningState.totalProfit += result.profit || 0;
            }
            
            // Store in database
            await this.storeOpportunityResult(opportunity, result);
        }
        
        // Emit processed opportunities
        this.emit('opportunitiesProcessed', {
            strategy: data.strategy,
            count: data.opportunities.length,
            successRate: this.calculateSuccessRate(),
            timestamp: new Date()
        });
    }

    /**
     * ⚡ EXECUTE OPPORTUNITY WITH REAL DATA
     * ====================================
     */
    async executeOpportunityWithRealData(opportunity) {
        try {
            // Get real pool data for opportunity execution
            const poolData = await this.getRealPoolDataForOpportunity(opportunity);
            
            if (!poolData || poolData.length === 0) {
                return {
                    success: false,
                    reason: 'No real pool data available',
                    executionTime: Date.now()
                };
            }
            
            // Simulate execution based on real data
            const executionResult = this.simulateArbitrageExecution(opportunity, poolData);
            
            console.log(`   ${executionResult.success ? '✅' : '❌'} ${opportunity.type}: ${executionResult.success ? `$${executionResult.profit?.toFixed(2)}` : executionResult.reason}`);
            
            return executionResult;
            
        } catch (error) {
            console.error(`❌ Error executing opportunity ${opportunity.id}:`, error.message);
            return {
                success: false,
                reason: error.message,
                executionTime: Date.now()
            };
        }
    }

    /**
     * 🎲 SIMULATE ARBITRAGE EXECUTION
     * ===============================
     */
    simulateArbitrageExecution(opportunity, poolData) {
        // Calculate success probability based on opportunity and real data
        const baseSuccessProbability = opportunity.successThreshold / 100;
        const dataQualityBonus = Math.min(0.2, poolData.length * 0.05); // Bonus for more data
        const aggressivenessBonus = opportunity.aggressiveness * 0.1;
        
        const successProbability = Math.min(0.95, baseSuccessProbability + dataQualityBonus + aggressivenessBonus);
        const isSuccess = Math.random() < successProbability;
        
        if (isSuccess) {
            // Calculate profit based on opportunity and real pool liquidity
            const avgLiquidity = poolData.reduce((sum, pool) => sum + (parseFloat(pool.liquidity) || 0), 0) / poolData.length;
            const liquidityMultiplier = Math.min(2.0, avgLiquidity / 1000000); // Scale based on liquidity
            
            const baseProfit = opportunity.expectedProfit * 10; // Convert percentage to dollars
            const realProfit = baseProfit * liquidityMultiplier * (0.8 + Math.random() * 0.4); // ±20% variance
            
            return {
                success: true,
                profit: Math.max(1, realProfit), // Minimum $1 profit
                executionTime: Date.now(),
                poolsUsed: poolData.length,
                liquidityUtilized: avgLiquidity
            };
        } else {
            const failureReasons = [
                'Insufficient liquidity',
                'Gas price too high',
                'Slippage exceeded threshold',
                'MEV bot competition',
                'Network congestion'
            ];
            
            return {
                success: false,
                reason: failureReasons[Math.floor(Math.random() * failureReasons.length)],
                executionTime: Date.now(),
                poolsChecked: poolData.length
            };
        }
    }

    /**
     * 📊 GET REAL POOL DATA FOR OPPORTUNITY
     * =====================================
     */
    async getRealPoolDataForOpportunity(opportunity) {
        try {
            const client = await this.dbPool.connect();
            
            // Get relevant pools based on opportunity type
            let query;
            let params = [];
            
            if (opportunity.type === 'arbitrage_execution') {
                // Get high-liquidity pools for arbitrage
                query = `
                    SELECT p.*, cpp.price_token0_usd as current_price, cpp.liquidity_usd as liquidity, cpp.volume_24h
                    FROM pools p
                    JOIN current_pool_prices cpp ON p.address = cpp.pool_address
                    WHERE cpp.liquidity_usd::numeric > $1
                    ORDER BY cpp.volume_24h::numeric DESC
                    LIMIT $2
                `;
                params = [1000000, 10]; // Min $1M liquidity, top 10 by volume
            } else if (opportunity.type === 'market_research') {
                // Get diverse pools for research
                query = `
                    SELECT p.*, cpp.price_token0_usd as current_price, cpp.liquidity_usd as liquidity, cpp.volume_24h
                    FROM pools p
                    JOIN current_pool_prices cpp ON p.address = cpp.pool_address
                    ORDER BY RANDOM()
                    LIMIT $1
                `;
                params = [15]; // Random 15 pools
            } else {
                // Default: get active pools
                query = `
                    SELECT p.*, cpp.price_token0_usd as current_price, cpp.liquidity_usd as liquidity, cpp.volume_24h
                    FROM pools p
                    JOIN current_pool_prices cpp ON p.address = cpp.pool_address
                    WHERE cpp.last_update > NOW() - INTERVAL '1 hour'
                    ORDER BY cpp.liquidity_usd::numeric DESC
                    LIMIT $1
                `;
                params = [8]; // Top 8 by liquidity
            }
            
            const result = await client.query(query, params);
            client.release();
            
            return result.rows;
            
        } catch (error) {
            console.error('❌ Error getting real pool data:', error.message);
            return [];
        }
    }

    /**
     * 📊 COLLECT REAL POOL DATA
     * =========================
     */
    async collectRealPoolData() {
        return await this.safeDbQuery(async () => {
            const client = await this.dbPool.connect();
            
            try {
                // Get current pool statistics
                const result = await client.query(`
                    SELECT 
                        COUNT(*) as total_pools,
                        SUM(liquidity_usd::numeric) as total_liquidity,
                        SUM(volume_24h::numeric) as total_volume,
                        AVG(liquidity_usd::numeric) as avg_liquidity
                    FROM current_pool_prices
                    WHERE last_update > NOW() - INTERVAL '1 hour'
                `);
                
                const stats = result.rows[0];
                
                this.learningState.realArbitrageData.push({
                    timestamp: new Date(),
                    totalPools: parseInt(stats.total_pools),
                    totalLiquidity: parseFloat(stats.total_liquidity || 0),
                    totalVolume: parseFloat(stats.total_volume || 0),
                    avgLiquidity: parseFloat(stats.avg_liquidity || 0)
                });
                
                // Keep only last 100 data points
                if (this.learningState.realArbitrageData.length > 100) {
                    this.learningState.realArbitrageData = this.learningState.realArbitrageData.slice(-100);
                }
                
                console.log(`📊 Pool data: ${stats.total_pools} pools, $${parseFloat(stats.total_liquidity || 0).toFixed(0)} liquidity`);
                
            } finally {
                client.release();
            }
        });
    }

    /**
     * 📊 MONITOR PRICE DELTAS
     * =======================
     */
    async monitorPriceDeltas() {
        return await this.safeDbQuery(async () => {
            const client = await this.dbPool.connect();
            
            try {
                // Get price deltas between pools for arbitrage opportunities
                const result = await client.query(`
                    WITH price_comparison AS (
                        SELECT 
                            p1.token0_symbol,
                            p1.token1_symbol,
                            p1.dex as dex1,
                            p2.dex as dex2,
                            p1.price_token0_usd::numeric as price1,
                            p2.price_token0_usd::numeric as price2,
                            p1.liquidity_usd::numeric as liquidity1,
                            p2.liquidity_usd::numeric as liquidity2,
                            p1.last_update as timestamp1,
                            p2.last_update as timestamp2,
                            ABS(p1.price_token0_usd::numeric - p2.price_token0_usd::numeric) / p1.price_token0_usd::numeric * 100 as price_delta_percent
                        FROM current_pool_prices p1
                        JOIN current_pool_prices p2 ON 
                            p1.token0_symbol = p2.token0_symbol 
                            AND p1.token1_symbol = p2.token1_symbol
                            AND p1.dex != p2.dex
                        WHERE p1.last_update > NOW() - INTERVAL '5 minutes'
                            AND p2.last_update > NOW() - INTERVAL '5 minutes'
                            AND p1.liquidity_usd::numeric > 100000
                            AND p2.liquidity_usd::numeric > 100000
                    )
                    SELECT *
                    FROM price_comparison
                    WHERE price_delta_percent > 0.3
                    ORDER BY price_delta_percent DESC
                    LIMIT 10
                `);
                
                if (result.rows.length > 0) {
                    console.log(`🎯 Found ${result.rows.length} arbitrage opportunities:`);
                    for (const opportunity of result.rows.slice(0, 3)) {
                        console.log(`   ${opportunity.token0_symbol}/${opportunity.token1_symbol}: ${opportunity.dex1} vs ${opportunity.dex2} (${parseFloat(opportunity.price_delta_percent).toFixed(2)}% delta)`);
                    }
                    
                    // Store arbitrage opportunities
                    await this.storeArbitrageOpportunities(result.rows);
                } else {
                    console.log(`📊 No significant arbitrage opportunities found (>0.3% delta)`);
                }
                
            } finally {
                client.release();
            }
        });
    }

    /**
     * 📊 PROCESS STRATEGY EVALUATION
     * ==============================
     */
    async processStrategyEvaluation(data) {
        console.log(`📊 Strategy evaluation: ${data.strategy} (${data.successRate.toFixed(1)}% success)`);
        
        this.learningState.strategiesEvaluated.add(data.strategy);
        
        // Store evaluation in performance history
        this.learningState.performanceHistory.push({
            type: 'strategy_evaluation',
            strategy: data.strategy,
            successRate: data.successRate,
            totalProfit: data.totalProfit,
            timestamp: data.timestamp
        });
        
        // Emit evaluation processed
        this.emit('strategyEvaluated', data);
    }

    /**
     * 📈 PROCESS PERFORMANCE REVIEW
     * =============================
     */
    async processPerformanceReview(data) {
        console.log(`📈 Performance review: ${data.metrics.successRate.toFixed(1)}% success, ${data.metrics.learningCycles} cycles`);
        
        this.learningState.learningCycles = data.metrics.learningCycles;
        
        // Store review in performance history
        this.learningState.performanceHistory.push({
            type: 'performance_review',
            metrics: data.metrics,
            timestamp: data.timestamp
        });
        
        // Emit review processed
        this.emit('performanceReviewed', data);
    }

    /**
     * 🔄 PROCESS OPPORTUNITY SWITCH
     * =============================
     */
    async processOpportunitySwitch(data) {
        console.log(`🔄 Opportunity switch: ${data.strategy?.name || 'Unknown'} (${data.successRate.toFixed(1)}% success)`);
        
        // Emit switch processed
        this.emit('opportunitySwitched', data);
    }

    /**
     * 💾 STORE OPPORTUNITY RESULT
     * ===========================
     */
    async storeOpportunityResult(opportunity, result) {
        try {
            const client = await this.dbPool.connect();
            
            // Store in a learning_results table (create if not exists)
            await client.query(`
                CREATE TABLE IF NOT EXISTS learning_results (
                    id SERIAL PRIMARY KEY,
                    opportunity_id VARCHAR(255),
                    opportunity_type VARCHAR(100),
                    strategy VARCHAR(100),
                    expected_profit DECIMAL(10,2),
                    actual_profit DECIMAL(10,2),
                    success BOOLEAN,
                    reason TEXT,
                    execution_time TIMESTAMP,
                    pools_used INTEGER,
                    liquidity_utilized DECIMAL(15,2),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await client.query(`
                INSERT INTO learning_results (
                    opportunity_id, opportunity_type, strategy, expected_profit,
                    actual_profit, success, reason, execution_time, pools_used, liquidity_utilized
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                opportunity.id,
                opportunity.type,
                opportunity.strategy,
                opportunity.expectedProfit,
                result.profit || 0,
                result.success,
                result.reason || null,
                new Date(result.executionTime),
                result.poolsUsed || 0,
                result.liquidityUtilized || 0
            ]);
            
            client.release();
            
        } catch (error) {
            console.error('❌ Error storing opportunity result:', error.message);
        }
    }

    /**
     * 📊 MONITOR LEARNING PERFORMANCE
     * ===============================
     */
    async monitorLearningPerformance() {
        const sessionDuration = Date.now() - this.learningState.sessionStartTime;
        const hourlyProfit = (this.learningState.totalProfit / sessionDuration) * 3600000; // Convert to hourly
        
        console.log('\n📊 LEARNING PERFORMANCE MONITOR');
        console.log('-'.repeat(40));
        console.log(`   Session duration: ${Math.round(sessionDuration / 60000)} minutes`);
        console.log(`   Total opportunities: ${this.learningState.totalOpportunities}`);
        console.log(`   Successful opportunities: ${this.learningState.successfulOpportunities}`);
        console.log(`   Success rate: ${this.calculateSuccessRate().toFixed(1)}%`);
        console.log(`   Total profit: $${this.learningState.totalProfit.toFixed(2)}`);
        console.log(`   Hourly profit rate: $${hourlyProfit.toFixed(2)}/hour`);
        console.log(`   Strategies evaluated: ${this.learningState.strategiesEvaluated.size}`);
        console.log(`   Learning cycles: ${this.learningState.learningCycles}`);
        
        // Emit performance monitoring
        this.emit('performanceMonitored', {
            sessionDuration,
            totalOpportunities: this.learningState.totalOpportunities,
            successRate: this.calculateSuccessRate(),
            totalProfit: this.learningState.totalProfit,
            hourlyProfit,
            strategiesEvaluated: this.learningState.strategiesEvaluated.size,
            timestamp: new Date()
        });
    }

    /**
     * 💾 SAVE LEARNING STATE
     * ======================
     */
    async saveLearningState() {
        try {
            const client = await this.dbPool.connect();
            
            // Create learning_sessions table if not exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS learning_sessions (
                    id SERIAL PRIMARY KEY,
                    session_start TIMESTAMP,
                    total_opportunities INTEGER,
                    successful_opportunities INTEGER,
                    total_profit DECIMAL(10,2),
                    learning_cycles INTEGER,
                    strategies_evaluated INTEGER,
                    performance_history JSONB,
                    real_arbitrage_data JSONB,
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            // Insert or update current session
            await client.query(`
                INSERT INTO learning_sessions (
                    session_start, total_opportunities, successful_opportunities,
                    total_profit, learning_cycles, strategies_evaluated,
                    performance_history, real_arbitrage_data
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                new Date(this.learningState.sessionStartTime),
                this.learningState.totalOpportunities,
                this.learningState.successfulOpportunities,
                this.learningState.totalProfit,
                this.learningState.learningCycles,
                this.learningState.strategiesEvaluated.size,
                JSON.stringify(this.learningState.performanceHistory.slice(-50)), // Last 50 entries
                JSON.stringify(this.learningState.realArbitrageData.slice(-20)) // Last 20 entries
            ]);
            
            client.release();
            console.log('💾 Learning state saved to database');
            
        } catch (error) {
            console.error('❌ Error saving learning state:', error.message);
        }
    }

    /**
     * 📊 HELPER METHODS
     * ================
     */
    calculateSuccessRate() {
        return this.learningState.totalOpportunities > 0 
            ? (this.learningState.successfulOpportunities / this.learningState.totalOpportunities) * 100 
            : 0;
    }

    getLearningStatus() {
        return {
            isActive: this.learningState.isActive,
            sessionDuration: Date.now() - this.learningState.sessionStartTime,
            totalOpportunities: this.learningState.totalOpportunities,
            successRate: this.calculateSuccessRate(),
            totalProfit: this.learningState.totalProfit,
            learningCycles: this.learningState.learningCycles,
            strategiesEvaluated: this.learningState.strategiesEvaluated.size,
            aggressiveLearnerStatus: this.aggressiveLearner.getLearningStatus(),
            realDataPoints: this.learningState.realArbitrageData.length
        };
    }

    /**
     * 🛑 SHUTDOWN
     * ==========
     */
    async shutdown() {
        console.log('🛑 Shutting down comprehensive learning integration...');
        
        // Save final learning state
        await this.saveLearningState();
        
        // Shutdown aggressive learner
        this.aggressiveLearner.shutdown();
        
        // Close database connections
        await this.dbPool.end();
        
        this.learningState.isActive = false;
        
        console.log('✅ Comprehensive learning integration shutdown complete');
    }

    /**
     * 💾 STORE ARBITRAGE OPPORTUNITIES
     * ===============================
     */
    async storeArbitrageOpportunities(opportunities) {
        try {
            const client = await this.dbPool.connect();
            
            // Create arbitrage_opportunities table if not exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
                    id SERIAL PRIMARY KEY,
                    token_pair VARCHAR(50),
                    dex1 VARCHAR(50),
                    dex2 VARCHAR(50),
                    price1 DECIMAL(20,8),
                    price2 DECIMAL(20,8),
                    price_delta_percent DECIMAL(10,4),
                    liquidity1 DECIMAL(15,2),
                    liquidity2 DECIMAL(15,2),
                    block_number BIGINT,
                    opportunity_timestamp TIMESTAMP,
                    detected_at TIMESTAMP DEFAULT NOW(),
                    potential_profit DECIMAL(10,2),
                    INDEX idx_arbitrage_timestamp (detected_at),
                    INDEX idx_arbitrage_delta (price_delta_percent),
                    INDEX idx_arbitrage_pair (token_pair)
                )
            `);
            
            // Get current block number (simulated for now)
            const currentBlockNumber = await this.getCurrentBlockNumber();
            
            // Insert opportunities
            for (const opp of opportunities) {
                const tokenPair = `${opp.token0_symbol}/${opp.token1_symbol}`;
                const potentialProfit = this.calculatePotentialProfit(opp);
                
                await client.query(`
                    INSERT INTO arbitrage_opportunities (
                        token_pair, dex1, dex2, price1, price2, price_delta_percent,
                        liquidity1, liquidity2, block_number, opportunity_timestamp, potential_profit
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `, [
                    tokenPair,
                    opp.dex1,
                    opp.dex2,
                    opp.price1,
                    opp.price2,
                    opp.price_delta_percent,
                    opp.liquidity1,
                    opp.liquidity2,
                    currentBlockNumber,
                    new Date(Math.max(new Date(opp.timestamp1), new Date(opp.timestamp2))),
                    potentialProfit
                ]);
            }
            
            client.release();
            console.log(`💾 Stored ${opportunities.length} arbitrage opportunities`);
            
        } catch (error) {
            console.error('❌ Error storing arbitrage opportunities:', error.message);
        }
    }

    /**
     * 🔗 GET CURRENT BLOCK NUMBER
     * ===========================
     */
    async getCurrentBlockNumber() {
        try {
            // For now, simulate block number
            // In production, this would connect to Arbitrum RPC
            const baseBlock = 250000000; // Approximate current Arbitrum block
            const randomOffset = Math.floor(Math.random() * 1000);
            return baseBlock + randomOffset;
        } catch (error) {
            console.error('❌ Error getting block number:', error.message);
            return Math.floor(Date.now() / 1000); // Fallback to timestamp
        }
    }

    /**
     * 💰 CALCULATE POTENTIAL PROFIT
     * =============================
     */
    calculatePotentialProfit(opportunity) {
        // Calculate potential profit based on price delta and liquidity
        const priceDelta = parseFloat(opportunity.price_delta_percent);
        const minLiquidity = Math.min(parseFloat(opportunity.liquidity1), parseFloat(opportunity.liquidity2));
        
        // Conservative profit calculation (assume 50% of price delta due to slippage/fees)
        const effectiveDelta = priceDelta * 0.5;
        
        // Profit scales with liquidity but caps at reasonable amounts
        const liquidityFactor = Math.min(minLiquidity / 1000000, 10); // Max 10x multiplier
        const baseProfitPer1Percent = 100; // $100 profit per 1% delta with $1M liquidity
        
        const potentialProfit = (effectiveDelta / 100) * baseProfitPer1Percent * liquidityFactor;
        
        return Math.max(1, Math.min(potentialProfit, 10000)); // Min $1, Max $10,000
    }

    /**
     * 🔍 MONITOR DATABASE POOL STATUS
     * ===============================
     */
    monitorDatabasePoolStatus() {
        const poolStatus = {
            totalCount: this.dbPool.totalCount,
            idleCount: this.dbPool.idleCount,
            waitingCount: this.dbPool.waitingCount,
            maxConnections: this.dbPool.options.max,
            connectionUtilization: ((this.dbPool.totalCount - this.dbPool.idleCount) / this.dbPool.options.max * 100).toFixed(1)
        };
        
        console.log(`🔍 DB Pool Status: ${poolStatus.totalCount}/${poolStatus.maxConnections} connections (${poolStatus.connectionUtilization}% utilized), ${poolStatus.idleCount} idle, ${poolStatus.waitingCount} waiting`);
        
        // Warning if pool is heavily utilized
        if (poolStatus.connectionUtilization > 80) {
            console.log('⚠️ Database pool heavily utilized - reducing query frequency');
            return false; // Signal to skip non-critical queries
        }
        
        return true; // OK to proceed with queries
    }

    /**
     * 🛡️ SAFE DATABASE QUERY
     * ======================
     */
    async safeDbQuery(queryFunction, fallbackValue = null) {
        try {
            // Check pool status before proceeding
            if (!this.monitorDatabasePoolStatus()) {
                console.log('⏭️ Skipping query due to high database load');
                return fallbackValue;
            }
            
            return await queryFunction();
        } catch (error) {
            console.error('❌ Safe database query failed:', error.message);
            return fallbackValue;
        }
    }
}

// Export the integration class and a factory function
async function startComprehensiveLearningIntegration() {
    const integration = new ComprehensiveLearningIntegration();
    await integration.startComprehensiveLearning();
    return integration;
}

export { 
    ComprehensiveLearningIntegration,
    startComprehensiveLearningIntegration
}; 