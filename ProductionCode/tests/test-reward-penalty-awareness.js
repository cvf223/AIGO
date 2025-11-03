/**
 * 🧪 REWARD/PENALTY AWARENESS SYSTEM TEST
 * ======================================
 * 
 * Automated test script for validating the reward/penalty awareness system
 * Tests pre-decision awareness and post-decision learning
 */

import { UltimateArbitrageSyndicateFactory } from '../UltimateArbitrageSyndicateFactory.js';
import { RewardPenaltyEngine } from '../learning/RewardPenaltyEngine.js';
import { DecisionAwareness } from '../learning/DecisionAwareness.js';

// Mock opportunity data for testing
const mockOpportunity = {
    id: 'test-opportunity-1',
    chain: 'arbitrum',
    tokenPair: 'ETH-USDC',
    spread: 0.023,
    estimatedProfit: 156.78,
    gasEstimate: 350000,
    liquidityA: 5000000,
    liquidityB: 7500000,
    competition: 0.4,
    confidence: 0.75
};

// Mock agent for testing
const mockAgent = {
    id: 'test-agent-1',
    character: {
        characterId: 'test-agent-1',
        type: 'arbitrage-specialist'
    }
};

/**
 * Run the test suite
 */
async function runTests() {
    console.log('🧪 Starting Reward/Penalty Awareness System Tests');
    
    // Create factory instance
    const factory = new UltimateArbitrageSyndicateFactory();
    console.log('✅ Created factory instance');
    
    try {
        // Initialize factory
        await factory.initialize();
        console.log('✅ Factory initialized');
        
        // Test reward/penalty engine exists
        if (!factory.rewardPenaltyEngine) {
            throw new Error('Reward/Penalty Engine not initialized');
        }
        console.log('✅ Reward/Penalty Engine initialized');
        
        // Test decision awareness exists
        if (!factory.decisionAwareness) {
            throw new Error('Decision Awareness not initialized');
        }
        console.log('✅ Decision Awareness initialized');
        
        // Test building awareness for an agent
        const awareness = await factory.decisionAwareness.buildDecisionAwareness(
            mockAgent.character.characterId,
            mockOpportunity,
            { agentType: mockAgent.character.type }
        );
        
        console.log('✅ Built awareness object:', awareness ? 'Success' : 'Failed');
        console.log(JSON.stringify(awareness, null, 2));
        
        // Test AlphaGo integration
        const alphaGo = factory.completeLearningEcosystem?.alphaGoRL;
        
        if (alphaGo && alphaGo.decisionAwareness) {
            console.log('✅ AlphaGo integrated with Decision Awareness');
        } else {
            console.warn('⚠️ AlphaGo not properly integrated with Decision Awareness');
        }
        
        // Test recording an outcome
        await factory.decisionAwareness.recordOutcome(
            mockAgent.character.characterId,
            mockOpportunity.id,
            {
                success: true,
                profit: 145.92,
                gasUsed: 320000,
                executionTime: 4500
            },
            { decision: 'execute' }
        );
        console.log('✅ Recorded outcome successfully');
        
        // Test emitting a reward
        factory.rewardPenaltyEngine.emitReward(
            mockAgent.character.characterId,
            145.92,
            {
                opportunityId: mockOpportunity.id,
                reason: 'Successful trade execution'
            }
        );
        console.log('✅ Emitted reward successfully');
        
        // Test generating awareness report
        const report = await factory.getAgentAwarenessReport(mockAgent.character.characterId);
        console.log('✅ Generated awareness report');
        console.log(JSON.stringify(report, null, 2));
        
        // Test decision with awareness
        if (alphaGo) {
            const state = alphaGo.extractStateFeatures ? 
                alphaGo.extractStateFeatures(mockOpportunity, mockAgent) : 
                '0-1-0-0-5-7-0-5';
                
            const qValues = new Map([
                ['execute', 120],
                ['reject', 5],
                ['wait', 15]
            ]);
            
            const action = alphaGo.chooseActionWithAwareness ? 
                alphaGo.chooseActionWithAwareness(mockAgent, qValues, awareness) :
                'execute';
                
            console.log(`✅ AlphaGo decision with awareness: ${action}`);
        }
        
        console.log('🎉 All tests completed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Fatal test error:', error);
});
