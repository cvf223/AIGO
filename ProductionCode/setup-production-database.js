#!/usr/bin/env node

/**
 * 🏗️ PRODUCTION DATABASE SETUP
 * ============================
 * 
 * Creates and initializes the complete production PostgreSQL database
 * with all required tables and indices for the Elite Arbitrage Syndicate
 * 
 * USAGE: node setup-production-database.js
 */

import { DatabaseConnectionManager } from './src/database/DatabaseConnectionManager.js';

class ProductionDatabaseSetup {
    constructor() {
        this.db = new DatabaseConnectionManager({
            connectionString: 'postgresql://postgres:password@localhost:5432/construction_syndicate'
        });
    }

    async setup() {
        try {
            console.log('🏗️ SETTING UP PRODUCTION DATABASE...');
            console.log('====================================');
            
            // Connect to database
            await this.db.connect();
            console.log('✅ Connected to production database');
            
            // Create additional tables needed for web GUI
            await this.createAdditionalTables();
            
            // Create indices for performance
            await this.createIndices();
            
            // Insert default system settings
            await this.insertDefaultSettings();
            
            // Create some test data if tables are empty
            await this.createTestData();
            
            console.log('');
            console.log('🎉 PRODUCTION DATABASE SETUP COMPLETE!');
            console.log('======================================');
            console.log('✅ All tables created');
            console.log('✅ Indices optimized');
            console.log('✅ Default settings configured');
            console.log('✅ Test data populated');
            console.log('');
            console.log('🚀 Ready to start Elite Web GUI!');
            
        } catch (error) {
            console.error('❌ Database setup failed:', error);
            throw error;
        } finally {
            await this.db.disconnect();
        }
    }

    async createAdditionalTables() {
        console.log('🏗️ Creating additional tables...');
        
        // Agent MDP states for RL integration
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS agent_mdp_states (
                id SERIAL PRIMARY KEY,
                agent_id VARCHAR(100) NOT NULL,
                state_vector JSONB NOT NULL,
                action_taken VARCHAR(100),
                reward_received DECIMAL(20,8),
                next_state_vector JSONB,
                episode_id VARCHAR(100),
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Pools table for DEX data
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS pools (
                pool_id SERIAL PRIMARY KEY,
                pool_address VARCHAR(42) UNIQUE NOT NULL,
                chain VARCHAR(20) NOT NULL,
                dex_name VARCHAR(50) NOT NULL,
                token0_address VARCHAR(42) NOT NULL,
                token1_address VARCHAR(42) NOT NULL,
                token0_symbol VARCHAR(20),
                token1_symbol VARCHAR(20),
                fee_tier INTEGER,
                liquidity_usd DECIMAL(20,2),
                volume_24h_usd DECIMAL(20,2),
                price_usd DECIMAL(30,18),
                price_source VARCHAR(50),
                last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                is_active BOOLEAN DEFAULT true
            )
        `);
        
        console.log('✅ Additional tables created');
    }

    async createIndices() {
        console.log('🔧 Creating performance indices...');
        
        const indices = [
            'CREATE INDEX IF NOT EXISTS idx_agents_active ON syndicate_agents(is_active, last_active)',
            'CREATE INDEX IF NOT EXISTS idx_opportunities_status ON arbitrage_opportunities(status, detected_at)',
            'CREATE INDEX IF NOT EXISTS idx_opportunities_profit ON arbitrage_opportunities(estimated_profit_usd DESC)',
            'CREATE INDEX IF NOT EXISTS idx_executions_status ON arbitrage_executions(execution_status, executed_at)',
            'CREATE INDEX IF NOT EXISTS idx_performance_agent ON agent_performance(agent_id, timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON agent_awareness_alerts(resolved, created_at)',
            'CREATE INDEX IF NOT EXISTS idx_gas_operations_chain ON gas_price_operations(chain, created_at)',
            'CREATE INDEX IF NOT EXISTS idx_pools_chain ON pools(chain, is_active)',
            'CREATE INDEX IF NOT EXISTS idx_pools_liquidity ON pools(liquidity_usd DESC)'
        ];
        
        for (const indexQuery of indices) {
            try {
                await this.db.query(indexQuery);
            } catch (error) {
                console.warn(`⚠️ Index creation warning: ${error.message}`);
            }
        }
        
        console.log('✅ Performance indices created');
    }

    async insertDefaultSettings() {
        console.log('⚙️ Inserting default system settings...');
        
        const defaultSettings = [
            ['operationMode', 'production', 'string'],
            ['collectiveLearning', 'true', 'boolean'],
            ['competitionMode', 'true', 'boolean'],
            ['dailyLossLimit', '5000', 'number'],
            ['maxFailedTrades', '50', 'number'],
            ['maxConcurrentAgents', '20', 'number'],
            ['minProfitThreshold', '100', 'number'],
            ['maxRiskScore', '0.3', 'number'],
            ['enableRealTimeUpdates', 'true', 'boolean'],
            ['enableBlockchainEvents', 'true', 'boolean']
        ];
        
        for (const [name, value, type] of defaultSettings) {
            try {
                await this.db.query(`
                    INSERT INTO system_settings (setting_name, setting_value, setting_type, updated_at)
                    VALUES ($1, $2, $3, NOW())
                    ON CONFLICT (setting_name) DO NOTHING
                `, [name, value, type]);
            } catch (error) {
                console.warn(`⚠️ Setting insertion warning: ${error.message}`);
            }
        }
        
        console.log('✅ Default settings configured');
    }

    async createTestData() {
        console.log('🧪 Creating test data if needed...');
        
        // Check if we have any agents
        const agentCount = await this.db.query('SELECT COUNT(*) FROM syndicate_agents');
        
        if (agentCount.rows[0].count == 0) {
            console.log('📊 Creating test agents...');
            
            const testAgents = [
                ['agent-001', 'ArbitrumFlashSpecialist', 'arbitrum', JSON.stringify({ specialization: 'flash_loans', max_position: 100000 })],
                ['agent-002', 'BaseDEXHunter', 'base', JSON.stringify({ specialization: 'dex_arbitrage', max_position: 75000 })],
                ['agent-003', 'PolygonScanner', 'polygon', JSON.stringify({ specialization: 'opportunity_detection', max_position: 50000 })]
            ];
            
            for (const [id, type, chain, specialization] of testAgents) {
                await this.db.query(`
                    INSERT INTO syndicate_agents (agent_id, agent_type, chain_assignment, specialization, last_active, is_active)
                    VALUES ($1, $2, $3, $4, NOW(), true)
                    ON CONFLICT (agent_id) DO NOTHING
                `, [id, type, chain, specialization]);
                
                // Create agent state
                await this.db.query(`
                    INSERT INTO agent_state (agent_id, memory_state, alphago_state)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (agent_id) DO NOTHING
                `, [id, JSON.stringify({ initialized: true, strategies: [] }), JSON.stringify({ stage: 'production', confidence: 75 })]);
            }
            
            console.log('✅ Test agents created');
        }
        
        // Create some test performance data
        const perfCount = await this.db.query('SELECT COUNT(*) FROM agent_performance');
        
        if (perfCount.rows[0].count == 0) {
            console.log('📈 Creating test performance data...');
            
            const testTasks = ['arbitrage_detection', 'gas_optimization', 'risk_assessment', 'execution_timing'];
            
            for (let i = 0; i < 50; i++) {
                const agentId = `agent-00${(i % 3) + 1}`;
                const taskName = testTasks[i % testTasks.length];
                const success = Math.random() > 0.2; // 80% success rate
                const reward = success ? Math.random() * 1000 + 100 : 0;
                const skillImprovement = success ? Math.random() * 2 + 0.5 : -0.1;
                
                await this.db.query(`
                    INSERT INTO agent_performance (agent_id, task_name, execution_time_ms, success, reward_earned, skill_improvement, timestamp)
                    VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${Math.floor(Math.random() * 720)} minutes')
                `, [agentId, taskName, Math.floor(Math.random() * 2000 + 500), success, reward, skillImprovement]);
            }
            
            console.log('✅ Test performance data created');
        }
        
        console.log('✅ Test data setup complete');
    }
}

// Auto-run if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new ProductionDatabaseSetup();
    
    setup.setup().catch(error => {
        console.error('💥 Setup failed:', error);
        process.exit(1);
    });
}

export { ProductionDatabaseSetup };
