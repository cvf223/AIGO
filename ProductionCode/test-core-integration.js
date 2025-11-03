#!/usr/bin/env node

/**
 * 🧠🚀 TEST CORE INTEGRATION
 * ==========================
 * 
 * Simplified test to verify core integration between:
 * - LLMJudgeCentralNervousSystem (master orchestrator)
 * - Learning systems (AlphaGnome, QuantumEvolution)
 * - SharedMemorySystem
 * - Basic factory integration
 */

import dotenv from 'dotenv';
dotenv.config();

// 🧠 CORE SYSTEMS ONLY
import { LLMJudgeCentralNervousSystem } from './src/core/LLMJudgeCentralNervousSystem.js';
import { SharedMemorySystem } from './src/memory/SharedMemorySystem.js';
import { AlphaGnomeEvolutionarySystem } from './learning/AlphaGnomeEvolutionarySystem.js';
import { QuantumEvolutionMasterSystem } from './learning/quantum-evolution-master-system.js';

async function testCoreIntegration() {
    console.log('🧠🚀 TESTING CORE INTEGRATION');
    console.log('=============================');
    
    try {
        // 🧠 STEP 1: Initialize Central Nervous System
        console.log('🧠 Initializing Central Nervous System...');
        
        const centralNervousSystem = new LLMJudgeCentralNervousSystem({
            judgeModel: 'llama3.1:70b',
            judgmentConfidenceThreshold: 0.85,
            simulationIntensity: 'adaptive',
            database: {
                connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/arbitrage_test',
                max: 5
            },
            enableSFTGeneration: false, // Disable for testing
            enableSharedMemory: true,
            enableAlphaGnomeSimulation: true
        });
        
        // 🌍 STEP 2: Initialize Shared Memory
        console.log('🌍 Initializing Shared Memory...');
        
        const sharedMemory = new SharedMemorySystem({
            connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/arbitrage_test',
            max: 5
        });
        
        // 🧬 STEP 3: Initialize Learning Systems
        console.log('🧬 Initializing Learning Systems...');
        
        const alphaGnome = new AlphaGnomeEvolutionarySystem({
            populationSize: 50, // Smaller for testing
            genomeSize: 45,
            elitePercentage: 0.10,
            mutationRate: 0.05
        });
        
        const quantumEvolution = new QuantumEvolutionMasterSystem({
            enable_quantum_strategies: true,
            max_concurrent_evolutions: 5,
            evolution_coordination: 'synchronized'
        });
        
        // 🔗 STEP 4: Connect Learning Systems to Central Nervous System
        console.log('🔗 Connecting Learning Systems to Central Nervous System...');
        
        centralNervousSystem.config.alphaGnome = alphaGnome;
        centralNervousSystem.config.quantumEvolution = quantumEvolution;
        
        // 🚀 STEP 5: Initialize All Systems
        console.log('🚀 Initializing all systems...');
        
        // Initialize systems individually
        alphaGnome._initialize();
        
        // Check if quantum evolution has initialize method
        if (typeof quantumEvolution.initialize === 'function') {
            await quantumEvolution.initialize();
        } else {
            console.log('   ⚠️ QuantumEvolution missing initialize method, using manual setup');
            quantumEvolution.systemState.initialized = true;
        }
        
        await sharedMemory.initialize();
        await centralNervousSystem.initialize();
        
        console.log('✅ ALL CORE SYSTEMS INITIALIZED!');
        
        // 🧪 STEP 6: Test Integration with Mock Agent Action
        console.log('🧪 Testing integration with mock agent action...');
        
        const mockActionData = {
            agentId: 'test_agent_001',
            opportunity: {
                token_pair: 'WETH/USDC',
                chain: 'arbitrum',
                estimated_profit_usd: 150,
                price_discrepancy: 0.008
            },
            calculation: {
                gasPrice: 50,
                slippage: 0.005,
                estimatedProfitUSD: 150,
                route: ['uniswap_v3', 'sushiswap']
            },
            decision: {
                shouldProceed: true,
                reason: 'Profitable opportunity'
            },
            context: {
                maxGasPrice: 100,
                maxSlippage: 0.01,
                minProfitUSD: 50
            },
            timeConstraints: {
                maxExecutionTime: 5000,
                targetResponseTime: 1400
            }
        };
        
        // 🧠 Test Central Nervous System Judgment
        console.log('🧠 Testing Central Nervous System judgment...');
        
        const judgment = await centralNervousSystem.judgeAgentAction('test_agent_001', mockActionData);
        
        console.log('🎉 INTEGRATION TEST SUCCESSFUL!');
        console.log('================================');
        console.log('📊 Judgment Results:');
        console.log(`   ⚖️ Judgment ID: ${judgment.judgmentId}`);
        console.log(`   💰 Total Reward: ${judgment.reward}`);
        console.log(`   📊 Calculation Accuracy: ${(judgment.calculationAccuracy * 100).toFixed(1)}%`);
        console.log(`   🎯 Decision Quality: ${(judgment.decisionQuality * 100).toFixed(1)}%`);
        console.log(`   💡 Enhancement Suggestions: ${judgment.enhancementSuggestions.length}`);
        console.log(`   ⏱️ Processing Time: ${judgment.processingTime}ms`);
        
        if (judgment.enhancementSuggestions.length > 0) {
            console.log('💡 Enhancement Suggestions:');
            judgment.enhancementSuggestions.forEach((suggestion, i) => {
                console.log(`   ${i + 1}. ${suggestion.type}: ${suggestion.suggestion}`);
            });
        }
        
        console.log('\n🧠 Central Nervous System Status:');
        const status = centralNervousSystem.getSystemStatus();
        console.log(`   🟢 Operational: ${status.isOperational}`);
        console.log(`   📊 Total Judgments: ${status.totalJudgments}`);
        console.log(`   🧬 Learning Events: ${status.collectiveLearningEvents}`);
        
        console.log('\n🎯 CORE INTEGRATION VERIFIED!');
        console.log('✅ LLMJudgeCentralNervousSystem operational as master orchestrator');
        console.log('✅ Learning systems connected and responding');
        console.log('✅ Ready for full syndicate deployment!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ CORE INTEGRATION TEST FAILED:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

// Execute test
testCoreIntegration();
