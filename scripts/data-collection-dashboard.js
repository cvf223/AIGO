#!/usr/bin/env node

/**
 * Data Collection Dashboard
 * 
 * Simple web dashboard to monitor:
 * - Collection statistics
 * - Arbitrage opportunities
 * - System health
 * - Database status
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataCollectionDashboard {
    constructor() {
        // PostgreSQL connection
        this.db = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/arbitrage_db',
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        this.port = process.env.DASHBOARD_PORT || 3000;
        this.server = null;
        this.startTime = Date.now();
    }

    async initialize() {
        // Check database connection
        try {
            await this.db.query('SELECT NOW()');
            console.log('📊 Dashboard connected to PostgreSQL database');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is set correctly');
            console.log('💡 Example: DATABASE_URL=postgresql://username:password@localhost:5432/arbitrage_db');
            throw error;
        }

        console.log('📊 Dashboard initialized');
    }

    async start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`🌐 Dashboard available at: http://localhost:${this.port}`);
            console.log('📊 Monitoring arbitrage data collection system...\n');
        });

        // Setup graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down dashboard...');
            this.server.close(() => {
                this.db.end();
                process.exit(0);
            });
        });
    }

    async handleRequest(req, res) {
        const url = new URL(req.url, `http://localhost:${this.port}`);
        
        try {
            switch (url.pathname) {
                case '/':
                    await this.handleDashboard(req, res);
                    break;
                case '/api/stats':
                    await this.handleStats(req, res);
                    break;
                case '/api/opportunities':
                    await this.handleOpportunities(req, res);
                    break;
                case '/api/pools':
                    await this.handlePools(req, res);
                    break;
                case '/api/gas':
                    await this.handleGas(req, res);
                    break;
                default:
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
            }
        } catch (error) {
            console.error('Dashboard error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        }
    }

    async handleDashboard(req, res) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>🎯 Arbitrage Data Collection Dashboard</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                        color: #fff; 
                        line-height: 1.6;
                    }
                    
                    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
                    
                    header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        padding: 20px;
                        background: rgba(0, 255, 136, 0.1);
                        border-radius: 10px;
                        border: 1px solid rgba(0, 255, 136, 0.3);
                    }
                    
                    h1 { 
                        color: #00ff88; 
                        font-size: 2.5em; 
                        margin-bottom: 10px;
                        text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
                    }
                    
                    .subtitle { 
                        color: #ccc; 
                        font-size: 1.2em; 
                    }
                    
                    .grid { 
                        display: grid; 
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
                        gap: 20px; 
                        margin-bottom: 30px; 
                    }
                    
                    .card { 
                        background: rgba(42, 42, 42, 0.8); 
                        padding: 25px; 
                        border-radius: 15px; 
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }
                    
                    .card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 15px 40px rgba(0, 255, 136, 0.2);
                    }
                    
                    .card h3 { 
                        color: #00ff88; 
                        margin-bottom: 15px; 
                        font-size: 1.3em;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .metric { 
                        font-size: 2.5em; 
                        font-weight: bold; 
                        color: #00ff88; 
                        text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
                        margin: 10px 0;
                    }
                    
                    .metric.secondary { 
                        font-size: 1.8em; 
                        color: #66ff99; 
                    }
                    
                    .status {
                        display: inline-block;
                        padding: 5px 15px;
                        border-radius: 20px;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 0.8em;
                    }
                    
                    .status.operational { 
                        background: #00ff88; 
                        color: #000; 
                    }
                    
                    .status.warning { 
                        background: #ffaa00; 
                        color: #000; 
                    }
                    
                    .status.error { 
                        background: #ff4444; 
                        color: #fff; 
                    }
                    
                    .opportunities-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    
                    .opportunities-table th,
                    .opportunities-table td {
                        padding: 12px;
                        text-align: left;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    
                    .opportunities-table th {
                        background: rgba(0, 255, 136, 0.2);
                        color: #00ff88;
                        font-weight: bold;
                    }
                    
                    .opportunities-table tr:hover {
                        background: rgba(0, 255, 136, 0.1);
                    }
                    
                    .refresh-btn {
                        background: linear-gradient(45deg, #00ff88, #00cc66);
                        color: #000;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: bold;
                        margin: 10px 5px;
                        transition: all 0.3s ease;
                        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
                    }
                    
                    .refresh-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(0, 255, 136, 0.5);
                    }
                    
                    .loading {
                        color: #666;
                        font-style: italic;
                    }
                    
                    .profit-positive { color: #00ff88; }
                    .profit-negative { color: #ff4444; }
                    
                    .chain-tag {
                        display: inline-block;
                        padding: 2px 8px;
                        background: rgba(0, 255, 136, 0.2);
                        border-radius: 10px;
                        font-size: 0.8em;
                        margin-right: 5px;
                    }
                    
                    @media (max-width: 768px) {
                        .container { padding: 10px; }
                        .grid { grid-template-columns: 1fr; }
                        h1 { font-size: 2em; }
                        .metric { font-size: 2em; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <header>
                        <h1>🎯 Arbitrage Data Collection Dashboard</h1>
                        <p class="subtitle">Real-time monitoring of free data sources & arbitrage opportunities</p>
                    </header>
                    
                    <div class="grid">
                        <div class="card">
                            <h3>📊 System Status</h3>
                            <p>Status: <span id="system-status" class="status operational">Loading...</span></p>
                            <p>Uptime: <span id="uptime" class="loading">-</span></p>
                            <p>Last Update: <span id="last-update" class="loading">-</span></p>
                        </div>
                        
                        <div class="card">
                            <h3>🗄️ Database Stats</h3>
                            <div class="metric" id="total-pools">-</div>
                            <p>Total Pools</p>
                            <p>Active: <span id="active-pools" class="loading">-</span></p>
                            <p>Quality Score: <span id="avg-quality" class="loading">-</span>/100</p>
                        </div>
                        
                        <div class="card">
                            <h3>💰 Liquidity Tracking</h3>
                            <div class="metric" id="total-liquidity">-</div>
                            <p>Total Liquidity (USD)</p>
                            <p>Price Updates: <span id="price-updates" class="loading">-</span></p>
                            <p>Updates/min: <span id="update-rate" class="loading">-</span></p>
                        </div>
                        
                        <div class="card">
                            <h3>🎯 Arbitrage Opportunities</h3>
                            <div class="metric" id="total-opportunities">-</div>
                            <p>Total Detected</p>
                            <p>Viable: <span id="viable-opportunities" class="loading">-</span></p>
                            <p>Avg Profit: $<span id="avg-profit" class="loading">-</span></p>
                        </div>
                        
                        <div class="card">
                            <h3>⛽ Gas Prices</h3>
                            <div id="gas-prices" class="loading">Loading gas prices...</div>
                        </div>
                        
                        <div class="card">
                            <h3>🏆 Top Chains</h3>
                            <div id="chain-stats" class="loading">Loading chain data...</div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>🔥 Recent Arbitrage Opportunities</h3>
                        <button class="refresh-btn" onclick="refreshData()">🔄 Refresh All Data</button>
                        <button class="refresh-btn" onclick="refreshOpportunities()">🎯 Refresh Opportunities</button>
                        
                        <table class="opportunities-table">
                            <thead>
                                <tr>
                                    <th>Token Pair</th>
                                    <th>Chains</th>
                                    <th>Price Delta</th>
                                    <th>Profit Estimate</th>
                                    <th>Gas Cost</th>
                                    <th>Net Profit</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="opportunities-table">
                                <tr><td colspan="7" class="loading">Loading opportunities...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <script>
                    let refreshInterval;
                    
                    async function fetchData(endpoint) {
                        try {
                            const response = await fetch(endpoint);
                            return await response.json();
                        } catch (error) {
                            console.error('Fetch error:', error);
                            return null;
                        }
                    }
                    
                    async function updateStats() {
                        const stats = await fetchData('/api/stats');
                        if (!stats) return;
                        
                        document.getElementById('total-pools').textContent = stats.totalPools?.toLocaleString() || '-';
                        document.getElementById('active-pools').textContent = stats.activePools?.toLocaleString() || '-';
                        document.getElementById('total-liquidity').textContent = '$' + (stats.totalLiquidity?.toLocaleString() || '-');
                        document.getElementById('avg-quality').textContent = stats.avgQuality?.toFixed(1) || '-';
                        document.getElementById('price-updates').textContent = stats.priceUpdates?.toLocaleString() || '-';
                        document.getElementById('update-rate').textContent = stats.updateRate?.toFixed(1) || '-';
                        document.getElementById('total-opportunities').textContent = stats.totalOpportunities?.toLocaleString() || '-';
                        document.getElementById('viable-opportunities').textContent = stats.viableOpportunities?.toLocaleString() || '-';
                        document.getElementById('avg-profit').textContent = stats.avgProfit?.toFixed(2) || '-';
                        
                        // Update system status
                        const statusElement = document.getElementById('system-status');
                        if (stats.systemHealth === 'good') {
                            statusElement.className = 'status operational';
                            statusElement.textContent = 'OPERATIONAL';
                        } else if (stats.systemHealth === 'warning') {
                            statusElement.className = 'status warning';
                            statusElement.textContent = 'WARNING';
                        } else {
                            statusElement.className = 'status error';
                            statusElement.textContent = 'ERROR';
                        }
                        
                        document.getElementById('uptime').textContent = stats.uptime || '-';
                        document.getElementById('last-update').textContent = new Date(stats.lastUpdate).toLocaleString() || '-';
                    }
                    
                    async function updateGasPrices() {
                        const gasData = await fetchData('/api/gas');
                        if (!gasData) return;
                        
                        const gasElement = document.getElementById('gas-prices');
                        gasElement.innerHTML = gasData.map(chain => 
                            '<div><span class="chain-tag">' + chain.chain.toUpperCase() + '</span>' + 
                            chain.gasPrice.toFixed(2) + ' gwei</div>'
                        ).join('');
                    }
                    
                    async function updateChainStats() {
                        const chainData = await fetchData('/api/pools');
                        if (!chainData) return;
                        
                        const chainElement = document.getElementById('chain-stats');
                        chainElement.innerHTML = chainData.map(chain => 
                            '<div><span class="chain-tag">' + chain.chain.toUpperCase() + '</span>' + 
                            chain.pools.toLocaleString() + ' pools ($' + 
                            (chain.liquidity / 1000000).toFixed(1) + 'M)</div>'
                        ).join('');
                    }
                    
                    async function updateOpportunities() {
                        const opportunities = await fetchData('/api/opportunities');
                        if (!opportunities) return;
                        
                        const tbody = document.getElementById('opportunities-table');
                        
                        if (opportunities.length === 0) {
                            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">No arbitrage opportunities found</td></tr>';
                            return;
                        }
                        
                        tbody.innerHTML = opportunities.map(opp => {
                            const netProfit = opp.profit_estimate - opp.gas_estimate;
                            const profitClass = netProfit > 0 ? 'profit-positive' : 'profit-negative';
                            
                            return '<tr>' +
                                '<td>' + opp.token_pair + '</td>' +
                                '<td><span class="chain-tag">MULTI</span></td>' +
                                '<td>' + (opp.price_delta * 100).toFixed(3) + '%</td>' +
                                '<td class="profit-positive">$' + opp.profit_estimate.toFixed(2) + '</td>' +
                                '<td>$' + opp.gas_estimate.toFixed(2) + '</td>' +
                                '<td class="' + profitClass + '">$' + netProfit.toFixed(2) + '</td>' +
                                '<td>' + (opp.viable ? '✅ VIABLE' : '❌ NOT VIABLE') + '</td>' +
                            '</tr>';
                        }).join('');
                    }
                    
                    async function refreshData() {
                        await Promise.all([
                            updateStats(),
                            updateGasPrices(),
                            updateChainStats(),
                            updateOpportunities()
                        ]);
                    }
                    
                    async function refreshOpportunities() {
                        await updateOpportunities();
                    }
                    
                    // Initial load
                    refreshData();
                    
                    // Auto-refresh every 10 seconds
                    refreshInterval = setInterval(refreshData, 10000);
                    
                    // Cleanup on page unload
                    window.addEventListener('beforeunload', () => {
                        if (refreshInterval) clearInterval(refreshInterval);
                    });
                </script>
            </body>
            </html>
        `);
    }

    async handleStats(req, res) {
        const statsResult = await this.db.query(`
            SELECT 
                COUNT(*) as totalPools,
                COUNT(CASE WHEN is_active = true THEN 1 END) as activePools,
                SUM(liquidity_usd) as totalLiquidity,
                AVG(data_quality_score) as avgQuality
            FROM pools
        `);
        const stats = statsResult.rows[0];

        const priceStatsResult = await this.db.query(`
            SELECT COUNT(*) as priceUpdates
            FROM price_history 
            WHERE timestamp > EXTRACT(EPOCH FROM NOW()) - 3600
        `);
        const priceStats = priceStatsResult.rows[0];

        const opportunityStatsResult = await this.db.query(`
            SELECT 
                COUNT(*) as totalOpportunities,
                COUNT(CASE WHEN viable = true THEN 1 END) as viableOpportunities,
                AVG(profit_estimate) as avgProfit
            FROM arbitrage_opportunities 
            WHERE detected_at > EXTRACT(EPOCH FROM NOW()) - 86400
        `);
        const opportunityStats = opportunityStatsResult.rows[0];

        const uptime = Math.round((Date.now() - this.startTime) / 1000 / 60); // minutes
        const updateRate = uptime > 0 ? (parseInt(priceStats?.priceUpdates) || 0) / uptime : 0;

        const response = {
            totalPools: parseInt(stats?.totalPools) || 0,
            activePools: parseInt(stats?.activePools) || 0,
            totalLiquidity: parseFloat(stats?.totalLiquidity) || 0,
            avgQuality: parseFloat(stats?.avgQuality) || 0,
            priceUpdates: parseInt(priceStats?.priceUpdates) || 0,
            updateRate,
            totalOpportunities: parseInt(opportunityStats?.totalOpportunities) || 0,
            viableOpportunities: parseInt(opportunityStats?.viableOpportunities) || 0,
            avgProfit: parseFloat(opportunityStats?.avgProfit) || 0,
            systemHealth: this.getSystemHealth(stats, priceStats),
            uptime: uptime + ' minutes',
            lastUpdate: new Date().toISOString()
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    }

    async handleOpportunities(req, res) {
        const opportunitiesResult = await this.db.query(`
            SELECT * FROM arbitrage_opportunities 
            WHERE detected_at > EXTRACT(EPOCH FROM NOW()) - 3600
            ORDER BY profit_estimate DESC 
            LIMIT 20
        `);
        const opportunities = opportunitiesResult.rows.map(opp => ({
            ...opp,
            profit_estimate: parseFloat(opp.profit_estimate),
            gas_estimate: parseFloat(opp.gas_estimate),
            price_delta: parseFloat(opp.price_delta)
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(opportunities || []));
    }

    async handlePools(req, res) {
        const chainStatsResult = await this.db.query(`
            SELECT 
                chain,
                COUNT(*) as pools,
                SUM(liquidity_usd) as liquidity
            FROM pools 
            WHERE is_active = true
            GROUP BY chain 
            ORDER BY liquidity DESC
        `);
        const chainStats = chainStatsResult.rows.map(stat => ({
            chain: stat.chain,
            pools: parseInt(stat.pools),
            liquidity: parseFloat(stat.liquidity) || 0
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(chainStats || []));
    }

    async handleGas(req, res) {
        const gasDataResult = await this.db.query(`
            SELECT DISTINCT 
                chain,
                base_fee as gasPrice
            FROM gas_tracker 
            WHERE timestamp > EXTRACT(EPOCH FROM NOW()) - 300
            AND (chain, timestamp) IN (
                SELECT chain, MAX(timestamp)
                FROM gas_tracker
                WHERE timestamp > EXTRACT(EPOCH FROM NOW()) - 300
                GROUP BY chain
            )
        `);
        const gasData = gasDataResult.rows.map(gas => ({
            chain: gas.chain,
            gasPrice: parseFloat(gas.gasPrice) || 0
        }));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(gasData || []));
    }

    getSystemHealth(stats, priceStats) {
        const activePools = parseInt(stats?.activePools) || 0;
        const recentUpdates = parseInt(priceStats?.priceUpdates) || 0;

        if (activePools > 100 && recentUpdates > 10) {
            return 'good';
        } else if (activePools > 50 || recentUpdates > 5) {
            return 'warning';
        } else {
            return 'error';
        }
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const dashboard = new DataCollectionDashboard();
    
    dashboard.initialize()
        .then(() => dashboard.start())
        .catch((error) => {
            console.error('💥 Dashboard failed:', error);
            process.exit(1);
        });
}

export { DataCollectionDashboard }; 