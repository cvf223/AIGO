/**
 * 🚀 ARBITRUM FLASH SPECIALIST LAUNCHER
 * ===================================
 * 
 * This script launches a REAL ElizaOS agent using:
 * ✅ The arbitrum-flash-specialist.character.json file
 * ✅ Database connection for persistent state
 * ✅ Blockchain backbone integration
 * ✅ All the proper ElizaOS runtime components
 * 
 * FINALLY - NO MORE MOCK BULLSHIT!
 */

import { createAgent } from '../launcher';
import { ArbitrumFlashSpecialistService } from './ArbitrumFlashSpecialist';
import { IAgentRuntime, Character } from '../types';
import { DatabaseAdapter } from '../database';
import fs from 'fs';
import path from 'path';

/**
 * 🏆 LAUNCH THE ARBITRUM FLASH SPECIALIST AGENT
 */
export async function launchArbitrumAgent(): Promise<IAgentRuntime> {
    console.log('🚀 Launching Arbitrum Flash Specialist Agent...');
    
    try {
        // 1. Load the character configuration
        const characterPath = path.join(process.cwd(), 'characters', 'arbitrum-flash-specialist.character.json');
        
        if (!fs.existsSync(characterPath)) {
            throw new Error(`Character file not found: ${characterPath}`);
        }
        
        const characterData = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
        console.log(`✅ Loaded character: ${characterData.name}`);
        
        // 2. Create the ElizaOS runtime
        const runtime = await createAgent(characterData, {
            serverPort: 3000,
            database: {
                url: process.env.DATABASE_URL || 'postgresql://localhost:5432/arbitrum_agent'
            },
            plugins: [
                // Register our custom plugin
                {
                    name: 'arbitrum-flash-specialist',
                    description: 'Arbitrum Flash Loan Specialist',
                    services: [
                        {
                            name: 'ArbitrumFlashSpecialistService',
                            service: ArbitrumFlashSpecialistService
                        }
                    ]
                }
            ]
        });
        
        console.log(`✅ ElizaOS runtime created for agent: ${runtime.character.name}`);
        
        // 3. Initialize the Arbitrum Flash Specialist service
        const arbitrumService = new ArbitrumFlashSpecialistService(runtime);
        await arbitrumService.initialize();
        
        // Register the service with the runtime
        runtime.registerService('ArbitrumFlashSpecialistService', arbitrumService);
        
        console.log('✅ Arbitrum Flash Specialist service registered');
        
        // 4. Setup database tables if needed
        await setupDatabaseTables(runtime.databaseAdapter);
        
        // 5. Start the agent
        await runtime.start();
        
        console.log('🎉 ARBITRUM FLASH SPECIALIST AGENT IS LIVE!');
        console.log(`📊 Agent ID: ${runtime.agentId}`);
        console.log(`💬 Character: ${runtime.character.name}`);
        console.log(`🔗 Database: Connected`);
        console.log(`⚡ Blockchain: Initializing...`);
        
        return runtime;
        
    } catch (error) {
        console.error('❌ Failed to launch Arbitrum agent:', error);
        throw error;
    }
}

/**
 * 💾 SETUP DATABASE TABLES
 */
async function setupDatabaseTables(database: DatabaseAdapter): Promise<void> {
    console.log('🗄️ Setting up database tables...');
    
    try {
        // Agent state table
        await database.query(`
            CREATE TABLE IF NOT EXISTS agent_state (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id VARCHAR(255) UNIQUE NOT NULL,
                memory_state JSONB NOT NULL,
                performance_data JSONB NOT NULL,
                alphago_state JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Opportunities table
        await database.query(`
            CREATE TABLE IF NOT EXISTS opportunities (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id VARCHAR(255) NOT NULL,
                opportunity_data JSONB NOT NULL,
                profitability_analysis JSONB NOT NULL,
                competition_analysis JSONB,
                execution_plan JSONB,
                outcome JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Learning episodes table
        await database.query(`
            CREATE TABLE IF NOT EXISTS learning_episodes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id VARCHAR(255) NOT NULL,
                episode_data JSONB NOT NULL,
                reward DECIMAL(18,8) NOT NULL,
                state_before JSONB NOT NULL,
                action_taken JSONB NOT NULL,
                state_after JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Execution history table
        await database.query(`
            CREATE TABLE IF NOT EXISTS execution_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id VARCHAR(255) NOT NULL,
                opportunity_id UUID,
                execution_data JSONB NOT NULL,
                success BOOLEAN NOT NULL,
                profit_usd DECIMAL(18,8),
                gas_used INTEGER,
                execution_time INTEGER,
                tx_hash VARCHAR(66),
                block_number INTEGER,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Create indexes for performance
        await database.query(`CREATE INDEX IF NOT EXISTS idx_agent_state_agent_id ON agent_state(agent_id)`);
        await database.query(`CREATE INDEX IF NOT EXISTS idx_opportunities_agent_id ON opportunities(agent_id)`);
        await database.query(`CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at)`);
        await database.query(`CREATE INDEX IF NOT EXISTS idx_learning_episodes_agent_id ON learning_episodes(agent_id)`);
        await database.query(`CREATE INDEX IF NOT EXISTS idx_execution_history_agent_id ON execution_history(agent_id)`);
        await database.query(`CREATE INDEX IF NOT EXISTS idx_execution_history_success ON execution_history(success)`);
        
        console.log('✅ Database tables created successfully');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    }
}

/**
 * 📊 GET AGENT PERFORMANCE STATS
 */
export async function getAgentStats(runtime: IAgentRuntime): Promise<any> {
    const service = runtime.getService('ArbitrumFlashSpecialistService') as ArbitrumFlashSpecialistService;
    
    if (!service) {
        throw new Error('Arbitrum Flash Specialist service not found');
    }
    
    const status = service.getAgentStatus();
    
    // Get additional stats from database
    const database = runtime.databaseAdapter;
    
    const opportunityCount = await database.query(
        'SELECT COUNT(*) as count FROM opportunities WHERE agent_id = $1',
        ['ARBITRUM_FLASH_SPECIALIST']
    );
    
    const executionCount = await database.query(
        'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE success = true) as successful FROM execution_history WHERE agent_id = $1',
        ['ARBITRUM_FLASH_SPECIALIST']
    );
    
    const profitSum = await database.query(
        'SELECT SUM(profit_usd) as total_profit FROM execution_history WHERE agent_id = $1 AND success = true',
        ['ARBITRUM_FLASH_SPECIALIST']
    );
    
    return {
        agent: {
            id: runtime.agentId,
            name: runtime.character.name,
            active: status.isActive,
            lastUpdate: status.lastUpdate
        },
        memory: status.memory,
        database: {
            opportunities: opportunityCount.rows[0].count,
            executions: executionCount.rows[0].total,
            successful_executions: executionCount.rows[0].successful,
            total_profit: profitSum.rows[0].total_profit || 0
        },
        performance: {
            success_rate: status.memory.execution_stats.success_rate,
            total_profit: status.memory.profit_tracking.total_profit,
            alphago_score: status.memory.alphago_rl.current_score
        }
    };
}

/**
 * 🛑 SHUTDOWN AGENT GRACEFULLY
 */
export async function shutdownAgent(runtime: IAgentRuntime): Promise<void> {
    console.log('🛑 Shutting down Arbitrum Flash Specialist...');
    
    try {
        const service = runtime.getService('ArbitrumFlashSpecialistService') as ArbitrumFlashSpecialistService;
        
        if (service) {
            // Save final state
            await service.saveAgentMemory();
            console.log('💾 Final state saved');
        }
        
        // Stop the runtime
        await runtime.stop();
        
        console.log('✅ Agent shutdown complete');
        
    } catch (error) {
        console.error('❌ Shutdown error:', error);
    }
}

// CLI execution
if (require.main === module) {
    (async () => {
        try {
            const runtime = await launchArbitrumAgent();
            
            // Handle graceful shutdown
            process.on('SIGINT', async () => {
                console.log('\n🛑 Received SIGINT, shutting down gracefully...');
                await shutdownAgent(runtime);
                process.exit(0);
            });
            
            process.on('SIGTERM', async () => {
                console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
                await shutdownAgent(runtime);
                process.exit(0);
            });
            
            // Keep the process alive
            setInterval(() => {
                // Print status every 5 minutes
                getAgentStats(runtime).then(stats => {
                    console.log(`📊 Agent Stats - Executions: ${stats.memory.execution_stats.total_executions}, Success Rate: ${stats.memory.execution_stats.success_rate.toFixed(1)}%, Profit: $${stats.memory.profit_tracking.total_profit.toFixed(1)}k`);
                }).catch(console.error);
            }, 300000); // 5 minutes
            
        } catch (error) {
            console.error('💥 Startup failed:', error);
            process.exit(1);
        }
    })();
}

export { launchArbitrumAgent as default }; 