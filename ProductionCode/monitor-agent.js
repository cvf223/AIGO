#!/usr/bin/env node

const { Client } = require('pg');

// PostgreSQL connection configuration
const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'construction_syndicate',
    user: 'epicbattlegods',
    password: '', // No password for local setup
    ssl: false,
};

async function createMonitoringDashboard() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('🐘 Connected to PostgreSQL for monitoring');
        
        // Clear screen and show header
        console.clear();
        console.log('🚀 === ARBITRUM FLASH SPECIALIST MONITORING DASHBOARD ===');
        console.log('📊 Real-time System Status & Performance Metrics');
        console.log('=' .repeat(60));
        
        // Start monitoring loop
        setInterval(async () => {
            try {
                await displaySystemStatus(client);
            } catch (error) {
                console.error('❌ Monitoring error:', error.message);
            }
        }, 5000); // Update every 5 seconds
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

async function displaySystemStatus(client) {
    const timestamp = new Date().toLocaleString();
    
    // Move cursor to top
    process.stdout.write('\x1b[H');
    
    console.log(`🕐 Last Update: ${timestamp}`);
    console.log('=' .repeat(60));
    
    // Database Tables Status
    const tablesResult = await client.query(`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    `);
    
    console.log('📊 DATABASE TABLES STATUS:');
    console.log(`   Total Tables: ${tablesResult.rows.length}`);
    
    // Performance Metrics
    try {
        const perfResult = await client.query('SELECT COUNT(*) as count FROM performance_metrics');
        console.log(`   📈 Performance Records: ${perfResult.rows[0].count}`);
    } catch (e) {
        console.log('   📈 Performance Records: 0');
    }
    
    // System Health
    try {
        const healthResult = await client.query('SELECT COUNT(*) as count FROM system_health ORDER BY timestamp DESC LIMIT 1');
        console.log(`   🏥 Health Records: ${healthResult.rows[0].count}`);
    } catch (e) {
        console.log('   🏥 Health Records: 0');
    }
    
    // RL System
    try {
        const rlResult = await client.query('SELECT COUNT(*) as count FROM rl_performance');
        console.log(`   🧠 RL Performance Records: ${rlResult.rows[0].count}`);
    } catch (e) {
        console.log('   🧠 RL Performance Records: 0');
    }
    
    // Arbitrage Opportunities
    try {
        const arbResult = await client.query('SELECT COUNT(*) as count FROM arbitrage_opportunities');
        console.log(`   💰 Arbitrage Opportunities: ${arbResult.rows[0].count}`);
    } catch (e) {
        console.log('   💰 Arbitrage Opportunities: 0');
    }
    
    // Memory System
    try {
        const memResult = await client.query('SELECT COUNT(*) as count FROM agent_memories');
        console.log(`   🧠 Agent Memories: ${memResult.rows[0].count}`);
    } catch (e) {
        console.log('   🧠 Agent Memories: 0');
    }
    
    // Blockchain Events
    try {
        const blockResult = await client.query('SELECT COUNT(*) as count FROM blockchain_events');
        console.log(`   ⛓️  Blockchain Events: ${blockResult.rows[0].count}`);
    } catch (e) {
        console.log('   ⛓️  Blockchain Events: 0');
    }
    
    console.log('=' .repeat(60));
    
    // Recent Activity
    console.log('📋 RECENT ACTIVITY:');
    
    try {
        const recentLogs = await client.query(`
            SELECT type, body, "createdAt" 
            FROM logs 
            ORDER BY "createdAt" DESC 
            LIMIT 5
        `);
        
        if (recentLogs.rows.length > 0) {
            recentLogs.rows.forEach(log => {
                const time = new Date(parseInt(log.createdAt)).toLocaleTimeString();
                console.log(`   ${time} [${log.type}] ${log.body.substring(0, 50)}...`);
            });
        } else {
            console.log('   No recent activity logged');
        }
    } catch (e) {
        console.log('   Unable to fetch recent logs');
    }
    
    console.log('=' .repeat(60));
    
    // System Process Status
    console.log('🔧 SYSTEM PROCESS STATUS:');
    
    // Check if agent process is running
    const { exec } = require('child_process');
    exec('ps aux | grep "run-arbitrum-agent-direct.js" | grep -v grep', (error, stdout, stderr) => {
        if (stdout.trim()) {
            const lines = stdout.trim().split('\n');
            console.log(`   ✅ Agent Process: RUNNING (${lines.length} instance${lines.length > 1 ? 's' : ''})`);
            
            // Extract memory usage
            const memMatch = stdout.match(/(\d+\.\d+)\s+(\d+\.\d+)/);
            if (memMatch) {
                console.log(`   💾 CPU: ${memMatch[1]}% | Memory: ${memMatch[2]}%`);
            }
        } else {
            console.log('   ❌ Agent Process: NOT RUNNING');
        }
    });
    
    // Check port status
    exec('lsof -i :3002', (error, stdout, stderr) => {
        if (stdout.trim()) {
            console.log('   🌐 Port 3002: ACTIVE');
        } else {
            console.log('   ⚠️  Port 3002: NOT LISTENING');
        }
    });
    
    console.log('=' .repeat(60));
    console.log('💡 Press Ctrl+C to exit monitoring');
    console.log('🔄 Auto-refresh every 5 seconds');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Monitoring stopped');
    process.exit(0);
});

// Start monitoring
createMonitoringDashboard().catch(console.error); 