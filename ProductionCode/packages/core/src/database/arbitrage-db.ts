/**
 * Comprehensive Arbitrage Database System
 * 
 * This system creates a local SQLite database optimized for:
 * - Flash loan arbitrage opportunities
 * - Multi-hop arbitrage tracking
 * - Cross-chain arbitrage monitoring
 * - Yield farming opportunity analysis
 * - Real-time price and liquidity data
 */

import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';
import fs from 'fs';

export interface Pool {
    id: string;
    address: string;
    dex: string;
    chain: string;
    chainId: number;
    token0: {
        address: string;
        symbol: string;
        decimals: number;
    };
    token1: {
        address: string;
        symbol: string;
        decimals: number;
    };
    fee: number;
    tickSpacing?: number;
    reserve0: number;
    reserve1: number;
    totalSupply: number;
    liquidityUSD: number;
    volume24h: number;
    volume7d: number;
    feesEarned24h: number;
    apr: number;
    isActive: boolean;
    lastUpdated: number;
}

export interface PricePoint {
    id: string;
    poolId: string;
    price: number;
    reserve0: number;
    reserve1: number;
    blockNumber: number;
    timestamp: number;
    gasPrice: number;
}

export interface ArbitrageOpportunity {
    id: string;
    poolA: string;
    poolB: string;
    tokenPair: string;
    priceA: number;
    priceB: number;
    priceDelta: number;
    profitEstimate: number;
    gasEstimate: number;
    liquidityRequired: number;
    viable: boolean;
    flashLoanProvider?: string;
    route?: string[];
    crossChain: boolean;
    detectedAt: number;
    executedAt?: number;
    actualProfit?: number;
    status: 'detected' | 'executing' | 'executed' | 'failed' | 'expired';
}

export interface MultiHopRoute {
    id: string;
    inputToken: string;
    outputToken: string;
    route: Pool[];
    estimatedOutput: number;
    priceImpact: number;
    gasEstimate: number;
    profitPotential: number;
    liquidityScore: number;
    isViable: boolean;
    detectedAt: number;
}

export interface YieldOpportunity {
    id: string;
    poolId: string;
    strategy: 'liquidity_mining' | 'yield_farming' | 'staking' | 'lending';
    baseApr: number;
    rewardApr: number;
    totalApr: number;
    impermanentLossRisk: number;
    liquidityRequired: number;
    timeHorizon: number; // in days
    riskScore: number; // 1-10, 10 being highest risk
    isActive: boolean;
    detectedAt: number;
}

export interface GasTracker {
    id: string;
    chain: string;
    blockNumber: number;
    baseFee: number;
    priorityFee: number;
    totalGas: number;
    timestamp: number;
}

export class ArbitrageDatabase {
    private db: Database | null = null;
    private dbPath: string;

    constructor() {
        this.dbPath = path.join(process.cwd(), 'data', 'arbitrage.db');
        this.ensureDirectoryExists();
    }

    private ensureDirectoryExists() {
        const dir = path.dirname(this.dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    async initialize(): Promise<void> {
        this.db = await open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });

        await this.createTables();
        await this.createIndexes();
        
        console.log('🗄️ Arbitrage database initialized');
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Pools table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS pools (
                id TEXT PRIMARY KEY,
                address TEXT NOT NULL,
                dex TEXT NOT NULL,
                chain TEXT NOT NULL,
                chain_id INTEGER NOT NULL,
                token0_address TEXT NOT NULL,
                token0_symbol TEXT NOT NULL,
                token0_decimals INTEGER NOT NULL,
                token1_address TEXT NOT NULL,
                token1_symbol TEXT NOT NULL,
                token1_decimals INTEGER NOT NULL,
                fee INTEGER NOT NULL,
                tick_spacing INTEGER,
                reserve0 REAL NOT NULL,
                reserve1 REAL NOT NULL,
                total_supply REAL NOT NULL,
                liquidity_usd REAL NOT NULL,
                volume_24h REAL NOT NULL,
                volume_7d REAL NOT NULL,
                fees_earned_24h REAL NOT NULL,
                apr REAL NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                last_updated INTEGER NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // Price history table for tracking price movements
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS price_history (
                id TEXT PRIMARY KEY,
                pool_id TEXT NOT NULL,
                price REAL NOT NULL,
                reserve0 REAL NOT NULL,
                reserve1 REAL NOT NULL,
                block_number INTEGER NOT NULL,
                timestamp INTEGER NOT NULL,
                gas_price REAL NOT NULL,
                FOREIGN KEY (pool_id) REFERENCES pools (id)
            )
        `);

        // Arbitrage opportunities table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
                id TEXT PRIMARY KEY,
                pool_a TEXT NOT NULL,
                pool_b TEXT NOT NULL,
                token_pair TEXT NOT NULL,
                price_a REAL NOT NULL,
                price_b REAL NOT NULL,
                price_delta REAL NOT NULL,
                profit_estimate REAL NOT NULL,
                gas_estimate REAL NOT NULL,
                liquidity_required REAL NOT NULL,
                viable BOOLEAN NOT NULL,
                flash_loan_provider TEXT,
                route TEXT, -- JSON array of addresses
                cross_chain BOOLEAN NOT NULL DEFAULT 0,
                detected_at INTEGER NOT NULL,
                executed_at INTEGER,
                actual_profit REAL,
                status TEXT NOT NULL DEFAULT 'detected',
                FOREIGN KEY (pool_a) REFERENCES pools (id),
                FOREIGN KEY (pool_b) REFERENCES pools (id)
            )
        `);

        // Multi-hop routes table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS multi_hop_routes (
                id TEXT PRIMARY KEY,
                input_token TEXT NOT NULL,
                output_token TEXT NOT NULL,
                route TEXT NOT NULL, -- JSON array of pool IDs
                estimated_output REAL NOT NULL,
                price_impact REAL NOT NULL,
                gas_estimate REAL NOT NULL,
                profit_potential REAL NOT NULL,
                liquidity_score REAL NOT NULL,
                is_viable BOOLEAN NOT NULL,
                detected_at INTEGER NOT NULL
            )
        `);

        // Yield opportunities table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS yield_opportunities (
                id TEXT PRIMARY KEY,
                pool_id TEXT NOT NULL,
                strategy TEXT NOT NULL,
                base_apr REAL NOT NULL,
                reward_apr REAL NOT NULL,
                total_apr REAL NOT NULL,
                impermanent_loss_risk REAL NOT NULL,
                liquidity_required REAL NOT NULL,
                time_horizon INTEGER NOT NULL,
                risk_score INTEGER NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                detected_at INTEGER NOT NULL,
                FOREIGN KEY (pool_id) REFERENCES pools (id)
            )
        `);

        // Gas tracker table
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS gas_tracker (
                id TEXT PRIMARY KEY,
                chain TEXT NOT NULL,
                block_number INTEGER NOT NULL,
                base_fee REAL NOT NULL,
                priority_fee REAL NOT NULL,
                total_gas REAL NOT NULL,
                timestamp INTEGER NOT NULL
            )
        `);

        // Execution results table for tracking performance
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS execution_results (
                id TEXT PRIMARY KEY,
                opportunity_id TEXT NOT NULL,
                tx_hash TEXT,
                success BOOLEAN NOT NULL,
                actual_profit REAL,
                gas_used REAL,
                execution_time INTEGER NOT NULL,
                error_message TEXT,
                FOREIGN KEY (opportunity_id) REFERENCES arbitrage_opportunities (id)
            )
        `);
    }

    private async createIndexes(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Create indexes for faster queries
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_pools_chain ON pools (chain)',
            'CREATE INDEX IF NOT EXISTS idx_pools_dex ON pools (dex)',
            'CREATE INDEX IF NOT EXISTS idx_pools_token_pair ON pools (token0_symbol, token1_symbol)',
            'CREATE INDEX IF NOT EXISTS idx_pools_liquidity ON pools (liquidity_usd)',
            'CREATE INDEX IF NOT EXISTS idx_pools_volume ON pools (volume_24h)',
            'CREATE INDEX IF NOT EXISTS idx_pools_active ON pools (is_active)',
            
            'CREATE INDEX IF NOT EXISTS idx_price_history_pool ON price_history (pool_id)',
            'CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history (timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_price_history_block ON price_history (block_number)',
            
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_detected ON arbitrage_opportunities (detected_at)',
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_viable ON arbitrage_opportunities (viable)',
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_profit ON arbitrage_opportunities (profit_estimate)',
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_status ON arbitrage_opportunities (status)',
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_cross_chain ON arbitrage_opportunities (cross_chain)',
            
            'CREATE INDEX IF NOT EXISTS idx_multi_hop_viable ON multi_hop_routes (is_viable)',
            'CREATE INDEX IF NOT EXISTS idx_multi_hop_profit ON multi_hop_routes (profit_potential)',
            'CREATE INDEX IF NOT EXISTS idx_multi_hop_detected ON multi_hop_routes (detected_at)',
            
            'CREATE INDEX IF NOT EXISTS idx_yield_active ON yield_opportunities (is_active)',
            'CREATE INDEX IF NOT EXISTS idx_yield_apr ON yield_opportunities (total_apr)',
            'CREATE INDEX IF NOT EXISTS idx_yield_risk ON yield_opportunities (risk_score)',
            
            'CREATE INDEX IF NOT EXISTS idx_gas_chain ON gas_tracker (chain)',
            'CREATE INDEX IF NOT EXISTS idx_gas_timestamp ON gas_tracker (timestamp)'
        ];

        for (const index of indexes) {
            await this.db.exec(index);
        }
    }

    // Pool operations
    async insertPool(pool: Pool): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.run(`
            INSERT OR REPLACE INTO pools (
                id, address, dex, chain, chain_id,
                token0_address, token0_symbol, token0_decimals,
                token1_address, token1_symbol, token1_decimals,
                fee, tick_spacing, reserve0, reserve1, total_supply,
                liquidity_usd, volume_24h, volume_7d, fees_earned_24h,
                apr, is_active, last_updated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            pool.id, pool.address, pool.dex, pool.chain, pool.chainId,
            pool.token0.address, pool.token0.symbol, pool.token0.decimals,
            pool.token1.address, pool.token1.symbol, pool.token1.decimals,
            pool.fee, pool.tickSpacing, pool.reserve0, pool.reserve1, pool.totalSupply,
            pool.liquidityUSD, pool.volume24h, pool.volume7d, pool.feesEarned24h,
            pool.apr, pool.isActive ? 1 : 0, pool.lastUpdated
        ]);
    }

    async getPoolsByChain(chain: string): Promise<Pool[]> {
        if (!this.db) throw new Error('Database not initialized');

        const rows = await this.db.all(`
            SELECT * FROM pools WHERE chain = ? AND is_active = 1
            ORDER BY liquidity_usd DESC
        `, [chain]);

        return rows.map(this.mapRowToPool);
    }

    async getTopLiquidityPools(limit: number = 100): Promise<Pool[]> {
        if (!this.db) throw new Error('Database not initialized');

        const rows = await this.db.all(`
            SELECT * FROM pools WHERE is_active = 1
            ORDER BY liquidity_usd DESC LIMIT ?
        `, [limit]);

        return rows.map(this.mapRowToPool);
    }

    // Price tracking operations
    async insertPricePoint(pricePoint: PricePoint): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.run(`
            INSERT INTO price_history (
                id, pool_id, price, reserve0, reserve1, 
                block_number, timestamp, gas_price
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            pricePoint.id, pricePoint.poolId, pricePoint.price,
            pricePoint.reserve0, pricePoint.reserve1,
            pricePoint.blockNumber, pricePoint.timestamp, pricePoint.gasPrice
        ]);
    }

    // Arbitrage operations
    async insertArbitrageOpportunity(opportunity: ArbitrageOpportunity): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        await this.db.run(`
            INSERT INTO arbitrage_opportunities (
                id, pool_a, pool_b, token_pair, price_a, price_b,
                price_delta, profit_estimate, gas_estimate, liquidity_required,
                viable, flash_loan_provider, route, cross_chain,
                detected_at, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            opportunity.id, opportunity.poolA, opportunity.poolB, opportunity.tokenPair,
            opportunity.priceA, opportunity.priceB, opportunity.priceDelta,
            opportunity.profitEstimate, opportunity.gasEstimate, opportunity.liquidityRequired,
            opportunity.viable ? 1 : 0, opportunity.flashLoanProvider,
            opportunity.route ? JSON.stringify(opportunity.route) : null,
            opportunity.crossChain ? 1 : 0, opportunity.detectedAt, opportunity.status
        ]);
    }

    async getViableArbitrageOpportunities(minProfit: number = 100): Promise<ArbitrageOpportunity[]> {
        if (!this.db) throw new Error('Database not initialized');

        const rows = await this.db.all(`
            SELECT * FROM arbitrage_opportunities 
            WHERE viable = 1 AND profit_estimate >= ? AND status = 'detected'
            ORDER BY profit_estimate DESC
        `, [minProfit]);

        return rows.map(this.mapRowToArbitrageOpportunity);
    }

    // Analysis queries
    async getArbitrageStats(timeframe: number = 86400): Promise<any> {
        if (!this.db) throw new Error('Database not initialized');

        const since = Date.now() / 1000 - timeframe;

        const stats = await this.db.get(`
            SELECT 
                COUNT(*) as total_opportunities,
                COUNT(CASE WHEN viable = 1 THEN 1 END) as viable_opportunities,
                AVG(profit_estimate) as avg_profit,
                MAX(profit_estimate) as max_profit,
                COUNT(CASE WHEN status = 'executed' THEN 1 END) as executed_count,
                AVG(CASE WHEN actual_profit IS NOT NULL THEN actual_profit END) as avg_actual_profit
            FROM arbitrage_opportunities 
            WHERE detected_at >= ?
        `, [since]);

        return stats;
    }

    private mapRowToPool(row: any): Pool {
        return {
            id: row.id,
            address: row.address,
            dex: row.dex,
            chain: row.chain,
            chainId: row.chain_id,
            token0: {
                address: row.token0_address,
                symbol: row.token0_symbol,
                decimals: row.token0_decimals
            },
            token1: {
                address: row.token1_address,
                symbol: row.token1_symbol,
                decimals: row.token1_decimals
            },
            fee: row.fee,
            tickSpacing: row.tick_spacing,
            reserve0: row.reserve0,
            reserve1: row.reserve1,
            totalSupply: row.total_supply,
            liquidityUSD: row.liquidity_usd,
            volume24h: row.volume_24h,
            volume7d: row.volume_7d,
            feesEarned24h: row.fees_earned_24h,
            apr: row.apr,
            isActive: row.is_active === 1,
            lastUpdated: row.last_updated
        };
    }

    private mapRowToArbitrageOpportunity(row: any): ArbitrageOpportunity {
        return {
            id: row.id,
            poolA: row.pool_a,
            poolB: row.pool_b,
            tokenPair: row.token_pair,
            priceA: row.price_a,
            priceB: row.price_b,
            priceDelta: row.price_delta,
            profitEstimate: row.profit_estimate,
            gasEstimate: row.gas_estimate,
            liquidityRequired: row.liquidity_required,
            viable: row.viable === 1,
            flashLoanProvider: row.flash_loan_provider,
            route: row.route ? JSON.parse(row.route) : undefined,
            crossChain: row.cross_chain === 1,
            detectedAt: row.detected_at,
            executedAt: row.executed_at,
            actualProfit: row.actual_profit,
            status: row.status
        };
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
} 