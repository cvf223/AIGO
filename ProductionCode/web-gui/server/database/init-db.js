import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Get database connection parameters from environment variables
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'construction_syndicate',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

/**
 * Initialize the database with schema and sample data
 */
async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database initialization...');
    
    // Read schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL
    console.log('Creating database schema...');
    await client.query(schemaSql);
    console.log('Schema created successfully.');
    
    console.log('Adding sample data...');
    await addSampleData(client);
    console.log('Sample data added successfully.');
    
    console.log('Database initialization completed successfully.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

/**
 * Add sample data for testing the UI
 */
async function addSampleData(client) {
  // Sample opportunities
  const opportunitySql = `
    INSERT INTO opportunities (agent_id, type, status, profit, execution_time, route, decision, trigger_tx, execution_tx) VALUES
    (1, 'flashloan', 'executed', 0.05, 120, 
      '[{"dex_name":"Uniswap V3", "token_in":"USDC", "token_out":"WETH", "amount_change":0.01}, 
        {"dex_name":"SushiSwap", "token_in":"WETH", "token_out":"USDC", "amount_change":0.052}]', 
      '{"confidence_score": 95, "risk_assessment": "Low", "market_conditions": "Stable", 
        "factors": {"price_impact": 0.1, "gas_cost": 0.01, "slippage": 0.05, "profit_ratio": 1.2}}',
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'),
      
    (1, 'direct', 'missed', 0.03, 150, 
      '[{"dex_name":"Balancer", "token_in":"USDC", "token_out":"WETH", "amount_change":0.008}, 
        {"dex_name":"Curve", "token_in":"WETH", "token_out":"USDC", "amount_change":0.032}]',
      '{"confidence_score": 85, "risk_assessment": "Medium", "market_conditions": "Volatile", 
        "factors": {"price_impact": 0.15, "gas_cost": 0.02, "slippage": 0.08, "profit_ratio": 1.05}}',
      '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef', 
      null),
      
    (2, 'multihop', 'executed', 0.12, 85,
      '[{"dex_name":"Uniswap V3", "token_in":"USDT", "token_out":"WETH", "amount_change":0.02}, 
        {"dex_name":"PancakeSwap", "token_in":"WETH", "token_out":"USDC", "amount_change":0.05},
        {"dex_name":"Balancer", "token_in":"USDC", "token_out":"USDT", "amount_change":0.12}]',
      '{"confidence_score": 98, "risk_assessment": "Very Low", "market_conditions": "Favorable", 
        "factors": {"price_impact": 0.05, "gas_cost": 0.008, "slippage": 0.03, "profit_ratio": 1.4}}',
      '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef', 
      '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789a')
  ON CONFLICT DO NOTHING;
  `;
  
  // Sample learnings
  const learningSql = `
    INSERT INTO learnings (agent_id, title, summary, details, category, importance, source, insights, tags, related_learnings) VALUES
    (1, 'Price Impact Optimization', 
      'Splitting larger trades into multiple smaller ones significantly reduces price impact on Arbitrum DEXes', 
      'Through extensive testing of various trade sizes on Arbitrum DEXes, we discovered that price impact follows a non-linear curve. For trades larger than 5 ETH equivalent, splitting into multiple trades of 1-2 ETH each and executing them with 3-block intervals results in 15-30% less price impact than a single large trade. This effect is most pronounced on Uniswap V3 pools with less than $1M TVL.',
      'strategy', 8, 'Transaction Analysis',
      '["Optimal trade size on Arbitrum ranges between 1-2 ETH equivalent", "3-block interval between split trades yields best results", "Smaller pools benefit more from trade splitting"]',
      '["price impact", "trade splitting", "arbitrum", "optimization"]',
      '{2, 5}'),
      
    (1, 'Competitor MEV Strategy Patterns', 
      'Identified key timing patterns in competitor arbitrage strategies that can be leveraged', 
      'Analysis of over 5,000 successful arbitrage transactions by leading MEV bots on Arbitrum revealed consistent timing patterns. Competitors typically wait 1.5-2.5 seconds after a significant swap before executing arbitrage, likely to aggregate multiple trades. During high congestion, they switch to immediate execution mode with higher gas fees. Their trigger sensitivity increases during volatile market conditions.',
      'competition', 9, 'Blockchain Analysis',
      '["Competitors have a 1.5-2.5 second deliberation window", "Gas strategy dynamically adjusts based on congestion", "Trigger thresholds lower during high volatility"]',
      '["mev", "competition", "timing", "arbitrage"]',
      '{3, 7}'),
      
    (2, 'Curve Pool Imbalance Indicators', 
      'Developed early warning system for upcoming Curve pool imbalances based on whale wallet movements', 
      'By monitoring specific whale wallets known to cause significant imbalances in Curve stablecoin pools, we developed an early detection system with 78% accuracy in predicting large trades 2-3 blocks before they occur. This provides crucial additional time to prepare arbitrage strategies. The system works by analyzing token approvals and gas fees paid by these wallets, which exhibit consistent patterns before large trades.',
      'market', 7, 'Wallet Behavior Analysis',
      '["Token approvals from whale wallets precede trades by 2-3 blocks on average", "78% prediction accuracy achieved", "Specific patterns detected in gas fee allocation before large trades"]',
      '["curve", "stablecoin", "prediction", "whales"]',
      '{1, 8}')
  ON CONFLICT DO NOTHING;
  `;
  
  // Sample messages
  const messageSql = `
    INSERT INTO messages (sender_id, recipient_id, content, timestamp, is_read) VALUES
    ('human', '1', 'What opportunities are you currently monitoring?', NOW() - INTERVAL '1 day', true),
    ('1', 'human', 'I am currently monitoring 24 potential arbitrage opportunities across Uniswap V3, SushiSwap, and Balancer pools. The most promising one is a USDC-WETH-USDT route with an estimated profit of 0.08 ETH.', NOW() - INTERVAL '1 day', true),
    ('human', '1', 'What factors are you considering for the USDC-WETH-USDT opportunity?', NOW() - INTERVAL '23 hours', true),
    ('1', 'human', 'For this opportunity, I am analyzing: 1) Price impact (currently low at 0.03%), 2) Gas costs (estimated 0.012 ETH), 3) Execution speed requirements (needs to execute within 2 blocks), 4) Historical stability of this route (has been profitable 86% of the time), and 5) Competition analysis (3 known competitors monitoring).', NOW() - INTERVAL '23 hours', true),
    ('human', '1', 'Please prioritize opportunities with lower competition, even if they have slightly lower profit.', NOW() - INTERVAL '10 hours', true),
    ('1', 'human', 'Understood. I have adjusted my opportunity scoring algorithm to weigh competition factors more heavily. Now prioritizing a WETH-LINK-UNI route with only 1 known competitor and 0.065 ETH estimated profit. Will continue monitoring and update you on results.', NOW() - INTERVAL '10 hours', true)
  ON CONFLICT DO NOTHING;
  `;
  
  // Sample requests
  const requestSql = `
    INSERT INTO requests (agent_id, agent_name, subject, content, category, priority, timestamp, is_read, is_resolved, resolution) VALUES
    (1, 'ArbitrumFlashSpecialist', 'Gas Optimization Assistance Needed', 
      'I have identified a recurring issue with gas optimization on Arbitrum. When executing multi-hop trades through Uniswap V3, the gas estimation is consistently 15-20% lower than actual consumption. This is reducing our effective profits. I believe this may be related to the way we are calculating calldataSize for complex paths. Can you review our gas calculation logic?',
      'technical', 'high', NOW() - INTERVAL '2 days', true, true,
      '{"timestamp": "'||(NOW() - INTERVAL '1 day 12 hours')||'", "content": "I have reviewed the gas calculation logic and found the issue. The problem was in the gasUsedEstimation function which was not properly accounting for the dynamic calldata size in V3 quoter calls. I have created a PR with a fix that includes proper byte counting for path encoding. This should resolve the 15-20% discrepancy you were experiencing."}'),
      
    (2, 'ETHAnalyst', 'New Arbitrage Route Discovery', 
      'I have discovered a potentially profitable arbitrage route that we are not currently monitoring. There appears to be a recurring imbalance between Curve and Balancer USDC-DAI pools that occurs approximately 30 minutes after the USDC-Circle daily settlement (around 16:30 UTC). This creates a short window with above-average price discrepancies. Would you like me to implement monitoring for this specific timing-based opportunity?',
      'strategy', 'medium', NOW() - INTERVAL '16 hours', true, false, null),
      
    (3, 'PolygonTrader', 'Urgent: API Rate Limit Reached', 
      'We have reached the rate limit for our Polygon RPC provider (Infura). This is causing delays in opportunity detection and execution. I need authorization to switch to the backup provider (Alchemy) and potentially upgrade our subscription tier to prevent this issue in the future. Current utilization metrics: 98.5% of allowed requests used in the past hour, with 42 failed calls due to rate limiting.',
      'technical', 'high', NOW() - INTERVAL '4 hours', false, false, null)
  ON CONFLICT DO NOTHING;
  `;
  
  // Sample agent stats
  const statsSql = `
    INSERT INTO agent_stats (agent_id, total_profit, profit_change, success_rate, success_rate_change, opportunities_count, opportunities_change, avg_execution_time, execution_time_change) VALUES
    (1, 1.25, 0.08, 86, 2.3, 42, 5, 110, -15.5),
    (2, 0.75, -0.03, 78, -1.2, 28, 2, 135, 5.8),
    (3, 0.92, 0.12, 81, 3.7, 35, 8, 95, -8.2),
    (4, 0.45, 0.05, 92, 0.0, 18, 1, 120, -2.3),
    (5, 1.05, 0.22, 75, 4.5, 31, 3, 105, -10.2)
  ON CONFLICT DO NOTHING;
  `;
  
  // Execute all sample data insertions
  await client.query(opportunitySql);
  await client.query(learningSql);
  await client.query(messageSql);
  await client.query(requestSql);
  await client.query(statsSql);
}

// Run if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

export { initializeDatabase, pool };
