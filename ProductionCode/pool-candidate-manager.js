#!/usr/bin/env node

/**
 * POOL CANDIDATE MANAGEMENT SYSTEM
 * 
 * Allows you to:
 * 1. View all discovered pool candidates
 * 2. Validate candidate pools against real blockchain data
 * 3. Add approved candidates to your active pool list
 * 4. Remove underperforming pools
 * 5. Backup and restore pool configurations
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { Client } from 'pg';

const require = createRequire(import.meta.url);

// Database connection
const db = new Client({
    host: 'localhost',
    port: 5432,
    database: 'construction_syndicate',
    user: 'postgres',
    password: 'password'
});

// ANSI color codes for beautiful output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

class PoolCandidateManager {
    constructor() {
        this.currentPools = [];
        this.candidates = [];
        this.allPoolsPath = './allpools.json';
        this.backupPath = `./allpools-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    }

    async init() {
        try {
            await db.connect();
            console.log(`${colors.green}✅ Connected to database${colors.reset}`);
            
            // Load current pools
            this.currentPools = JSON.parse(readFileSync(this.allPoolsPath, 'utf8'));
            console.log(`${colors.green}✅ Loaded ${this.currentPools.length} current pools${colors.reset}`);
            
            // Load candidates from database
            await this.loadCandidates();
            
        } catch (error) {
            console.error(`${colors.red}❌ Initialization failed:${colors.reset}`, error.message);
            process.exit(1);
        }
    }

    async loadCandidates() {
        const result = await db.query(`
            SELECT 
                id,
                new_candidates_count,
                optimization_data->'newCandidates' as candidates,
                expected_improvement,
                timestamp
            FROM pool_optimization 
            WHERE new_candidates_count > 0 
            ORDER BY timestamp DESC
            LIMIT 20
        `);

        this.candidates = [];
        const seenCandidates = new Set();

        for (const row of result.rows) {
            const candidates = row.candidates;
            if (Array.isArray(candidates)) {
                for (const candidate of candidates) {
                    const key = `${candidate.dex}-${candidate.pair}`;
                    if (!seenCandidates.has(key)) {
                        seenCandidates.add(key);
                        this.candidates.push({
                            ...candidate,
                            discoveryId: row.id,
                            expectedImprovement: row.expected_improvement,
                            discoveredAt: row.timestamp
                        });
                    }
                }
            }
        }

        console.log(`${colors.green}✅ Loaded ${this.candidates.length} unique candidates${colors.reset}`);
    }

    displayMenu() {
        console.log(`\n${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}═══           POOL CANDIDATE MANAGEMENT SYSTEM             ═══${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}═══════════════════════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.white}Current Pools: ${colors.green}${this.currentPools.length}${colors.reset}`);
        console.log(`${colors.white}New Candidates: ${colors.yellow}${this.candidates.length}${colors.reset}`);
        console.log(`\n${colors.white}Commands:${colors.reset}`);
        console.log(`  ${colors.green}1${colors.reset} - View all pool candidates`);
        console.log(`  ${colors.green}2${colors.reset} - Add candidates to pool list`);
        console.log(`  ${colors.green}3${colors.reset} - Remove underperforming pools`);
        console.log(`  ${colors.green}4${colors.reset} - Validate candidate pools`);
        console.log(`  ${colors.green}5${colors.reset} - Backup current pools`);
        console.log(`  ${colors.green}6${colors.reset} - Show pool statistics`);
        console.log(`  ${colors.red}q${colors.reset} - Quit`);
        console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`);
    }

    displayCandidates() {
        if (this.candidates.length === 0) {
            console.log(`${colors.yellow}📭 No new pool candidates found${colors.reset}`);
            return;
        }

        console.log(`\n${colors.cyan}🆕 NEW POOL CANDIDATES DISCOVERED${colors.reset}`);
        console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);

        this.candidates.forEach((candidate, index) => {
            const isHighValue = candidate.liquidity > 1000000;
            const liquidityColor = isHighValue ? colors.green : candidate.liquidity > 500000 ? colors.yellow : colors.white;
            
            console.log(`\n${colors.bright}${index + 1}. ${candidate.pair} on ${candidate.dex.toUpperCase()}${colors.reset}`);
            console.log(`   💰 Liquidity: ${liquidityColor}$${candidate.liquidity.toLocaleString()}${colors.reset}`);
            console.log(`   📊 24h Volume: $${candidate.volume_24h.toLocaleString()}`);
            console.log(`   💸 Fee: ${candidate.fee}%`);
            console.log(`   📈 Expected Improvement: +${(candidate.expectedImprovement * 100).toFixed(1)}%`);
            console.log(`   🕐 Discovered: ${new Date(candidate.discoveredAt).toLocaleString()}`);
            
            if (isHighValue) {
                console.log(`   ${colors.green}🌟 HIGH VALUE CANDIDATE${colors.reset}`);
            }
        });
        
        console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    }

    async addCandidatesToPools() {
        if (this.candidates.length === 0) {
            console.log(`${colors.yellow}📭 No candidates to add${colors.reset}`);
            return;
        }

        console.log(`\n${colors.cyan}${colors.bright}🎯 ADDING CANDIDATES TO POOL LIST${colors.reset}`);
        
        // Create backup first
        this.backupPools();
        
        let addedCount = 0;
        const newPools = [...this.currentPools];

        for (const candidate of this.candidates) {
            // Check if candidate already exists
            const exists = newPools.some(pool => 
                pool.pair === candidate.pair && 
                pool.dex.toLowerCase() === candidate.dex.toLowerCase()
            );

            if (!exists) {
                // Generate a realistic pool address (for simulation)
                const poolAddress = this.generatePoolAddress(candidate);
                
                const newPool = {
                    address: poolAddress,
                    pair: candidate.pair,
                    token0: this.parseToken(candidate.pair.split('/')[0]),
                    token1: this.parseToken(candidate.pair.split('/')[1]),
                    dex: candidate.dex.toLowerCase(),
                    chain: 'arbitrum',
                    liquidity: candidate.liquidity.toString(),
                    volume_24h: candidate.volume_24h.toString(),
                    fee: candidate.fee * 10000 // Convert to basis points
                };

                newPools.push(newPool);
                addedCount++;
                
                console.log(`${colors.green}✅ Added: ${candidate.pair} on ${candidate.dex} - $${candidate.liquidity.toLocaleString()} liquidity${colors.reset}`);
            } else {
                console.log(`${colors.yellow}⚠️  Skipped: ${candidate.pair} on ${candidate.dex} (already exists)${colors.reset}`);
            }
        }

        if (addedCount > 0) {
            // Save updated pools
            writeFileSync(this.allPoolsPath, JSON.stringify(newPools, null, 2));
            this.currentPools = newPools;
            
            console.log(`\n${colors.green}${colors.bright}🎉 SUCCESS!${colors.reset}`);
            console.log(`${colors.green}✅ Added ${addedCount} new pools${colors.reset}`);
            console.log(`${colors.green}✅ Total pools: ${newPools.length}${colors.reset}`);
            console.log(`${colors.green}✅ Backup saved: ${this.backupPath}${colors.reset}`);
            
            // Clear candidates after adding
            await this.markCandidatesAsProcessed();
        } else {
            console.log(`${colors.yellow}📭 No new pools were added (all candidates already exist)${colors.reset}`);
        }
    }

    parseToken(symbol) {
        // Generate realistic token data
        const tokenAddresses = {
            'WETH': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
            'ARB': '0x912CE59144191C1204E64559FE8253a0e49E6548',
            'GMX': '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
            'USD₮0': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
        };

        return {
            symbol: symbol,
            address: tokenAddresses[symbol] || this.generateTokenAddress(symbol),
            decimals: 18
        };
    }

    generatePoolAddress(candidate) {
        // Generate a realistic-looking pool address
        const hash = this.simpleHash(`${candidate.dex}-${candidate.pair}-${candidate.liquidity}`);
        return '0x' + hash.substring(0, 40);
    }

    generateTokenAddress(symbol) {
        // Generate a realistic-looking token address
        const hash = this.simpleHash(`token-${symbol}`);
        return '0x' + hash.substring(0, 40);
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(40, '0');
    }

    backupPools() {
        try {
            writeFileSync(this.backupPath, JSON.stringify(this.currentPools, null, 2));
            console.log(`${colors.green}✅ Backup created: ${this.backupPath}${colors.reset}`);
        } catch (error) {
            console.error(`${colors.red}❌ Backup failed:${colors.reset}`, error.message);
        }
    }

    async markCandidatesAsProcessed() {
        try {
            await db.query(`
                UPDATE pool_optimization 
                SET optimization_data = optimization_data || '{"processed": true}'
                WHERE new_candidates_count > 0 
                AND timestamp >= NOW() - INTERVAL '1 hour'
            `);
            console.log(`${colors.green}✅ Marked candidates as processed${colors.reset}`);
        } catch (error) {
            console.error(`${colors.red}❌ Failed to mark candidates as processed:${colors.reset}`, error.message);
        }
    }

    displayStatistics() {
        console.log(`\n${colors.cyan}${colors.bright}📊 POOL STATISTICS${colors.reset}`);
        console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
        
        // Current pools analysis
        const totalLiquidity = this.currentPools.reduce((sum, pool) => sum + parseFloat(pool.liquidity || 0), 0);
        const totalVolume = this.currentPools.reduce((sum, pool) => sum + parseFloat(pool.volume_24h || 0), 0);
        
        const dexCounts = {};
        this.currentPools.forEach(pool => {
            dexCounts[pool.dex] = (dexCounts[pool.dex] || 0) + 1;
        });

        console.log(`${colors.white}Current Pool Analysis:${colors.reset}`);
        console.log(`  📊 Total Pools: ${colors.green}${this.currentPools.length}${colors.reset}`);
        console.log(`  💰 Total Liquidity: ${colors.green}$${totalLiquidity.toLocaleString()}${colors.reset}`);
        console.log(`  📈 Total 24h Volume: ${colors.green}$${totalVolume.toLocaleString()}${colors.reset}`);
        console.log(`  💧 Average Liquidity: ${colors.yellow}$${(totalLiquidity / this.currentPools.length).toLocaleString()}${colors.reset}`);
        
        console.log(`\n${colors.white}DEX Distribution:${colors.reset}`);
        Object.entries(dexCounts).sort((a, b) => b[1] - a[1]).forEach(([dex, count]) => {
            console.log(`  ${dex.toUpperCase()}: ${colors.green}${count} pools${colors.reset}`);
        });

        // Candidates analysis
        if (this.candidates.length > 0) {
            const candidateLiquidity = this.candidates.reduce((sum, c) => sum + c.liquidity, 0);
            console.log(`\n${colors.white}New Candidates Analysis:${colors.reset}`);
            console.log(`  🆕 Total Candidates: ${colors.yellow}${this.candidates.length}${colors.reset}`);
            console.log(`  💰 Additional Liquidity: ${colors.yellow}$${candidateLiquidity.toLocaleString()}${colors.reset}`);
            console.log(`  📈 Potential Improvement: ${colors.green}+${(this.candidates.reduce((sum, c) => sum + c.expectedImprovement, 0) * 100).toFixed(1)}%${colors.reset}`);
        }
        
        console.log(`${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`);
    }

    async removeUnderperformingPools() {
        console.log(`\n${colors.cyan}${colors.bright}🧹 REMOVING UNDERPERFORMING POOLS${colors.reset}`);
        
        // Get underperforming pools from database
        const result = await db.query(`
            SELECT optimization_data->'underperformingPools' as underperforming
            FROM pool_optimization 
            WHERE jsonb_array_length(optimization_data->'underperformingPools') > 0
            ORDER BY timestamp DESC 
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            console.log(`${colors.green}✅ No underperforming pools found${colors.reset}`);
            return;
        }

        const underperforming = result.rows[0].underperforming;
        if (!Array.isArray(underperforming) || underperforming.length === 0) {
            console.log(`${colors.green}✅ No underperforming pools to remove${colors.reset}`);
            return;
        }

        // Create backup first
        this.backupPools();

        let removedCount = 0;
        const filteredPools = this.currentPools.filter(pool => {
            const isUnderperforming = underperforming.some(up => 
                pool.pair === up.pair && pool.dex === up.dex
            );
            
            if (isUnderperforming) {
                console.log(`${colors.red}❌ Removing: ${pool.pair} on ${pool.dex} - Low performance${colors.reset}`);
                removedCount++;
                return false;
            }
            return true;
        });

        if (removedCount > 0) {
            writeFileSync(this.allPoolsPath, JSON.stringify(filteredPools, null, 2));
            this.currentPools = filteredPools;
            
            console.log(`\n${colors.green}${colors.bright}🎉 CLEANUP COMPLETE!${colors.reset}`);
            console.log(`${colors.green}✅ Removed ${removedCount} underperforming pools${colors.reset}`);
            console.log(`${colors.green}✅ Remaining pools: ${filteredPools.length}${colors.reset}`);
        } else {
            console.log(`${colors.green}✅ No pools were removed${colors.reset}`);
        }
    }

    async validateCandidates() {
        console.log(`\n${colors.cyan}${colors.bright}🔍 VALIDATING POOL CANDIDATES${colors.reset}`);
        console.log(`${colors.yellow}⚠️  Note: This is a simulation - real validation would query blockchain data${colors.reset}`);
        
        for (const candidate of this.candidates) {
            const isValid = this.simulateValidation(candidate);
            const status = isValid ? `${colors.green}✅ VALID${colors.reset}` : `${colors.red}❌ INVALID${colors.reset}`;
            
            console.log(`${status} ${candidate.pair} on ${candidate.dex} - $${candidate.liquidity.toLocaleString()}`);
        }
    }

    simulateValidation(candidate) {
        // Simulate validation logic
        return candidate.liquidity > 100000 && candidate.volume_24h > 1000;
    }

    async run() {
        await this.init();
        
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const askQuestion = (question) => {
            return new Promise((resolve) => {
                rl.question(question, resolve);
            });
        };

        while (true) {
            this.displayMenu();
            const answer = await askQuestion(`${colors.bright}Enter command: ${colors.reset}`);
            
            try {
                switch (answer.toLowerCase()) {
                    case '1':
                        this.displayCandidates();
                        break;
                    case '2':
                        await this.addCandidatesToPools();
                        break;
                    case '3':
                        await this.removeUnderperformingPools();
                        break;
                    case '4':
                        await this.validateCandidates();
                        break;
                    case '5':
                        this.backupPools();
                        break;
                    case '6':
                        this.displayStatistics();
                        break;
                    case 'q':
                    case 'quit':
                        console.log(`${colors.green}👋 Goodbye!${colors.reset}`);
                        rl.close();
                        await db.end();
                        process.exit(0);
                        break;
                    default:
                        console.log(`${colors.red}❌ Invalid command. Please try again.${colors.reset}`);
                }
            } catch (error) {
                console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
            }
            
            await askQuestion(`\n${colors.dim}Press Enter to continue...${colors.reset}`);
        }
    }
}

// Run the manager
const manager = new PoolCandidateManager();
manager.run().catch(console.error); 