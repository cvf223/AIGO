import { Plugin, Action, IAgentRuntime, Memory, State, HandlerCallback, ActionExample } from "../types";
import fs from 'fs';
import path from 'path';
// BLOCKCHAIN REMOVED: import { ethers } from "ethers";

// Pool Management Action
const poolManagementAction: Action = {
    name: "MANAGE_POOL_CANDIDATES",
    similes: [
        "SHOW_POOLS",
        "VIEW_POOLS", 
        "LIST_POOLS",
        "POOL_STATS",
        "SHOW_CANDIDATES",
        "ADD_CANDIDATES",
        "POOL_MANAGEMENT"
    ],
    description: "Manages arbitrage pool candidates with comprehensive statistics and operations",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = message.content.text?.toLowerCase() || "";
        return text.includes("pool") || 
               text.includes("candidate") || 
               text.includes("liquidity") ||
               text.includes("stats") ||
               text.includes("show") ||
               text.includes("add") ||
               text.includes("list");
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        try {
            const text = message.content.text?.toLowerCase() || "";
            console.log(`[POOL_MANAGEMENT] Processing command: "${text}"`);
            
            // Load pools data
            const poolsPath = path.join(process.cwd(), 'allpools.json');
            let pools = [];
            let response = "";
            
            if (fs.existsSync(poolsPath)) {
                const poolsData = fs.readFileSync(poolsPath, 'utf8');
                pools = JSON.parse(poolsData);
            }
            
            if (text.includes("show pools") || text.includes("list pools") || text.includes("view pools")) {
                // Show current pools
                const totalPools = pools.length;
                const totalLiquidity = pools.reduce((sum: number, pool: any) => sum + (parseFloat(pool.liquidity_usd) || 0), 0);
                
                response = `🏊 **CURRENT ARBITRAGE POOLS**\n\n`;
                response += `📊 **SUMMARY:**\n`;
                response += `• Total Pools: ${totalPools}\n`;
                response += `• Total Liquidity: $${totalLiquidity.toLocaleString()}\n\n`;
                
                if (totalPools > 0) {
                    response += `🔝 **TOP 5 POOLS:**\n`;
                    const topPools = pools
                        .sort((a: any, b: any) => (parseFloat(b.liquidity_usd) || 0) - (parseFloat(a.liquidity_usd) || 0))
                        .slice(0, 5);
                    
                    topPools.forEach((pool: any, index: number) => {
                        const liquidity = parseFloat(pool.liquidity_usd) || 0;
                        response += `${index + 1}. ${pool.token0_symbol}/${pool.token1_symbol} - $${liquidity.toLocaleString()}\n`;
                    });
                } else {
                    response += `⚠️ No pools currently loaded.`;
                }
                
            } else {
                // Default help message
                response = `�� **POOL MANAGEMENT COMMANDS**\n\n`;
                response += `Available commands:\n`;
                response += `• "show pools" - View current pool list\n`;
                response += `• "show candidates" - View discovered candidates\n`;
                response += `• "add candidates" - Add candidates to pool list\n`;
                response += `• "pool stats" - Show comprehensive statistics\n\n`;
                response += `💡 **TIP:** Try "show me the current pools" or "give me pool statistics"`;
            }
            
            console.log(`[POOL_MANAGEMENT] Generated response: ${response.substring(0, 100)}...`);
            
            if (callback) {
                callback({
                    text: response,
                    action: "MANAGE_POOL_CANDIDATES"
                });
            }
            
            return true;
            
        } catch (error) {
            console.error(`[POOL_MANAGEMENT] Error:`, error);
            
            const errorResponse = `❌ **ERROR**: Failed to process pool management command.\n\nPlease try again or contact support.`;
            
            if (callback) {
                callback({
                    text: errorResponse,
                    action: "MANAGE_POOL_CANDIDATES"
                });
            }
            
            return false;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "show pools" }
            },
            {
                user: "{{agentName}}",
                content: { 
                    text: "🏊 **CURRENT ARBITRAGE POOLS**\n\n📊 **SUMMARY:**\n• Total Pools: 36\n• Total Liquidity: $26,412,139\n\n🔝 **TOP 5 POOLS:**\n1. WETH/USDC - $5,200,000\n2. ARB/WETH - $3,800,000\n3. GMX/USDC - $2,100,000\n4. LINK/WETH - $1,900,000\n5. UNI/WETH - $1,600,000",
                    action: "MANAGE_POOL_CANDIDATES"
                }
            }
        ]
    ] as ActionExample[]
};

// Pool Management Plugin
export const poolManagementPlugin: Plugin = {
    name: "pool-management",
    description: "Comprehensive arbitrage pool management system with Telegram integration",
    actions: [poolManagementAction],
    evaluators: [],
    providers: [],
    services: []
};

export default poolManagementPlugin;
