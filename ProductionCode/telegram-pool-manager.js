/**
 * TELEGRAM POOL MANAGEMENT MODULE
 * 
 * Provides pool candidate management functionality for Telegram bot
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync } from 'fs';
import { Client } from 'pg';

const require = createRequire(import.meta.url);

export class TelegramPoolManager {
    constructor() {
        this.db = new Client({
            host: 'localhost',
            port: 5432,
            database: 'construction_syndicate',
            user: 'postgres',
            password: 'password'
        });
    }

    async handlePoolCommand(text) {
        try {
            await this.db.connect();
            
            if (text.includes('show pool') || text.includes('view pool') || text.includes('pool list')) {
                return await this.showCurrentPools();
            } else if (text.includes('show candidate') || text.includes('view candidate') || text.includes('candidate list') || text.includes('new pools')) {
                return await this.showCandidates();
            } else if (text.includes('add candidate') || text.includes('add pools') || text.includes('add new pools')) {
                return await this.addCandidates();
            } else if (text.includes('pool stat') || text.includes('pool summary') || text.includes('pool info')) {
                return await this.showStatistics();
            } else if (text.includes('backup pool') || text.includes('save pool')) {
                return await this.backupPools();
            } else {
                return this.showHelp();
            }
        } catch (error) {
            return `❌ **POOL MANAGEMENT ERROR**\n\nError: ${error.message}\n\n🔧 Please check database connection and try again.`;
        } finally {
            await this.db.end();
        }
    }

    async showCurrentPools() {
        const currentPools = JSON.parse(readFileSync('./allpools.json', 'utf8'));
        const totalLiquidity = currentPools.reduce((sum, pool) => sum + parseFloat(pool.liquidity || 0), 0);
        const dexCounts = {};
        
        currentPools.forEach(pool => {
            dexCounts[pool.dex] = (dexCounts[pool.dex] || 0) + 1;
        });

        const dexList = Object.entries(dexCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([dex, count]) => `• ${dex.toUpperCase()}: ${count} pools`)
            .join('\n');

        return `🏊‍♂️ **CURRENT POOL STATUS**\n\n📊 **Total Pools:** ${currentPools.length}\n💰 **Total Liquidity:** $${totalLiquidity.toLocaleString()}\n💧 **Average Liquidity:** $${(totalLiquidity / currentPools.length).toLocaleString()}\n\n🏛️ **DEX Distribution:**\n${dexList}\n\n💡 Use 'show candidates' to see new discoveries!`;
    }

    async showCandidates() {
        const result = await this.db.query(`
            SELECT id, new_candidates_count, optimization_data->'newCandidates' as candidates, 
                   expected_improvement, timestamp 
            FROM pool_optimization 
            WHERE new_candidates_count > 0 
            ORDER BY timestamp DESC LIMIT 10
        `);

        const candidates = [];
        const seenCandidates = new Set();

        for (const row of result.rows) {
            const rowCandidates = row.candidates;
            if (Array.isArray(rowCandidates)) {
                for (const candidate of rowCandidates) {
                    const key = `${candidate.dex}-${candidate.pair}`;
                    if (!seenCandidates.has(key)) {
                        seenCandidates.add(key);
                        candidates.push({
                            ...candidate,
                            expectedImprovement: row.expected_improvement,
                            discoveredAt: row.timestamp
                        });
                    }
                }
            }
        }

        if (candidates.length === 0) {
            return '📭 **NO NEW CANDIDATES**\n\nNo new pool candidates discovered yet. The background research system will find new opportunities during quiet market periods.';
        }

        const candidateList = candidates.slice(0, 5).map((candidate) => {
            const isHighValue = candidate.liquidity > 1000000;
            const valueIcon = isHighValue ? '🌟' : candidate.liquidity > 500000 ? '⭐' : '💧';
            
            return `${valueIcon} **${candidate.pair}** on **${candidate.dex.toUpperCase()}**\n   💰 Liquidity: $${candidate.liquidity.toLocaleString()}\n   📊 Volume: $${candidate.volume_24h.toLocaleString()}\n   💸 Fee: ${candidate.fee}%\n   📈 Expected: +${(candidate.expectedImprovement * 100).toFixed(1)}%`;
        }).join('\n\n');

        const totalCandidateLiquidity = candidates.reduce((sum, c) => sum + c.liquidity, 0);

        return `🆕 **NEW POOL CANDIDATES DISCOVERED**\n\n${candidateList}\n\n📊 **Summary:**\n• Total Candidates: ${candidates.length}\n• Additional Liquidity: $${totalCandidateLiquidity.toLocaleString()}\n• Potential Improvement: +${(candidates.reduce((sum, c) => sum + c.expectedImprovement, 0) * 100).toFixed(1)}%\n\n💡 Use 'add candidates' to add them to your pool list!`;
    }

    async addCandidates() {
        const result = await this.db.query(`
            SELECT id, new_candidates_count, optimization_data->'newCandidates' as candidates, 
                   expected_improvement 
            FROM pool_optimization 
            WHERE new_candidates_count > 0 
            ORDER BY timestamp DESC LIMIT 10
        `);

        const candidates = [];
        const seenCandidates = new Set();

        for (const row of result.rows) {
            const rowCandidates = row.candidates;
            if (Array.isArray(rowCandidates)) {
                for (const candidate of rowCandidates) {
                    const key = `${candidate.dex}-${candidate.pair}`;
                    if (!seenCandidates.has(key)) {
                        seenCandidates.add(key);
                        candidates.push(candidate);
                    }
                }
            }
        }

        if (candidates.length === 0) {
            return '📭 **NO CANDIDATES TO ADD**\n\nNo new pool candidates available to add.';
        }

        const currentPools = JSON.parse(readFileSync('./allpools.json', 'utf8'));
        const backupPath = `./allpools-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        writeFileSync(backupPath, JSON.stringify(currentPools, null, 2));

        let addedCount = 0;
        const newPools = [...currentPools];
        const addedPools = [];

        for (const candidate of candidates) {
            const exists = newPools.some(pool => 
                pool.pair === candidate.pair && 
                pool.dex.toLowerCase() === candidate.dex.toLowerCase()
            );

            if (!exists) {
                const newPool = this.createPoolFromCandidate(candidate);
                newPools.push(newPool);
                addedPools.push(candidate);
                addedCount++;
            }
        }

        if (addedCount > 0) {
            writeFileSync('./allpools.json', JSON.stringify(newPools, null, 2));
            
            await this.db.query(`
                UPDATE pool_optimization 
                SET optimization_data = optimization_data || '{"processed": true}'
                WHERE new_candidates_count > 0 
                AND timestamp >= NOW() - INTERVAL '1 hour'
            `);

            const addedList = addedPools.map(p => 
                `• ${p.pair} on ${p.dex} - $${p.liquidity.toLocaleString()}`
            ).join('\n');

            return `🎉 **POOL CANDIDATES ADDED SUCCESSFULLY!**\n\n✅ **Added ${addedCount} new pools:**\n${addedList}\n\n📊 **Updated Stats:**\n• Total pools: ${newPools.length}\n• Backup saved: ${backupPath.split('/').pop()}\n\n🚀 Your agent is now monitoring more opportunities!`;
        } else {
            return '⚠️ **NO NEW POOLS ADDED**\n\nAll candidates already exist in your pool list.';
        }
    }

    async showStatistics() {
        const currentPools = JSON.parse(readFileSync('./allpools.json', 'utf8'));
        const totalLiquidity = currentPools.reduce((sum, pool) => sum + parseFloat(pool.liquidity || 0), 0);
        const totalVolume = currentPools.reduce((sum, pool) => sum + parseFloat(pool.volume_24h || 0), 0);
        
        const dexCounts = {};
        currentPools.forEach(pool => {
            dexCounts[pool.dex] = (dexCounts[pool.dex] || 0) + 1;
        });

        const result = await this.db.query(`
            SELECT COUNT(*) as candidate_count, 
                   SUM((optimization_data->'newCandidates'->0->>'liquidity')::numeric) as candidate_liquidity 
            FROM pool_optimization 
            WHERE new_candidates_count > 0 
            AND timestamp >= NOW() - INTERVAL '24 hours'
        `);

        const candidateStats = result.rows[0];
        
        const dexList = Object.entries(dexCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([dex, count]) => `• ${dex.toUpperCase()}: ${count} pools`)
            .join('\n');

        return `📊 **COMPREHENSIVE POOL STATISTICS**\n\n🏊‍♂️ **Current Pool Analysis:**\n• Total Pools: ${currentPools.length}\n• Total Liquidity: $${totalLiquidity.toLocaleString()}\n• Total 24h Volume: $${totalVolume.toLocaleString()}\n• Average Liquidity: $${(totalLiquidity / currentPools.length).toLocaleString()}\n\n🏛️ **Top DEX Distribution:**\n${dexList}\n\n🆕 **Discovery Stats (24h):**\n• New candidates found: ${candidateStats.candidate_count || 0}\n• Additional liquidity discovered: $${parseFloat(candidateStats.candidate_liquidity || 0).toLocaleString()}\n\n🎯 Use 'show candidates' to see discoveries!`;
    }

    async backupPools() {
        const currentPools = JSON.parse(readFileSync('./allpools.json', 'utf8'));
        const backupPath = `./allpools-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        writeFileSync(backupPath, JSON.stringify(currentPools, null, 2));

        const totalLiquidity = currentPools.reduce((sum, pool) => sum + parseFloat(pool.liquidity || 0), 0);

        return `💾 **POOL BACKUP CREATED**\n\n✅ Backup saved: ${backupPath.split('/').pop()}\n📊 Backed up ${currentPools.length} pools\n💰 Total liquidity: $${totalLiquidity.toLocaleString()}\n\n🔒 Your pool configuration is safely backed up!`;
    }

    showHelp() {
        return `🏊‍♂️ **POOL MANAGEMENT COMMANDS**\n\n📋 **Available Commands:**\n• "show pools" - View current pool list\n• "show candidates" - View discovered candidates\n• "add candidates" - Add candidates to pool list\n• "pool stats" - Show comprehensive statistics\n• "backup pools" - Create pool backup\n\n💡 **Example:** "show me the new pool candidates"\n\n🤖 I'm continuously discovering new high-value pools during quiet market periods!`;
    }

    createPoolFromCandidate(candidate) {
        const generatePoolAddress = (candidate) => {
            let hash = 0;
            const str = `${candidate.dex}-${candidate.pair}-${candidate.liquidity}`;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return '0x' + Math.abs(hash).toString(16).padStart(40, '0');
        };

        const parseToken = (symbol) => {
            const tokenAddresses = {
                'WETH': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                'USDC': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
                'ARB': '0x912CE59144191C1204E64559FE8253a0e49E6548',
                'GMX': '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a',
                'USD₮0': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
            };

            return {
                symbol: symbol,
                address: tokenAddresses[symbol] || generatePoolAddress({dex: 'token', pair: symbol, liquidity: 0}),
                decimals: 18
            };
        };

        return {
            address: generatePoolAddress(candidate),
            pair: candidate.pair,
            token0: parseToken(candidate.pair.split('/')[0]),
            token1: parseToken(candidate.pair.split('/')[1]),
            dex: candidate.dex.toLowerCase(),
            chain: 'arbitrum',
            liquidity: candidate.liquidity.toString(),
            volume_24h: candidate.volume_24h.toString(),
            fee: candidate.fee * 10000
        };
    }
} 