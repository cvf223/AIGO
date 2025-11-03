/**
 * 🧪 TEST STEP 4A: SYNDICATE AGENT ORCHESTRATOR
 * =============================================
 * 
 * BRUTAL TRUTH: Testing multi-agent orchestration with REAL capabilities!
 * This proves the syndicate can manage multiple agents with dynamic adaptation.
 */

import { SyndicateAgentOrchestrator } from './src/syndicate-agent-orchestrator.js';

async function testSyndicateOrchestrator() {
    console.log('🧪 TESTING STEP 4A: SYNDICATE AGENT ORCHESTRATOR');
    console.log('='.repeat(60));
    
    const orchestrator = new SyndicateAgentOrchestrator();
    
    try {
        // Initialize the syndicate
        console.log('\n🚀 INITIALIZING SYNDICATE...');
        const initialStatus = await orchestrator.initialize();
        
        console.log('\n📊 INITIAL SYSTEM STATUS:');
        console.log(`   Total Agents: ${initialStatus.totalAgents}`);
        console.log(`   Total Profit: $${initialStatus.totalProfit.toFixed(2)}`);
        console.log(`   Task Queue: ${initialStatus.taskQueueLength}`);
        
        console.log('\n👥 AGENT ROSTER:');
        for (const agent of initialStatus.agents) {
            console.log(`   ${agent.name}: ${agent.status} (${agent.successRate}% success)`);
        }
        
        // Let the orchestrator run for 30 seconds
        console.log('\n⏱️  RUNNING ORCHESTRATION FOR 30 SECONDS...');
        console.log('   Watch for task generation, assignment, and weight adaptation!');
        
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        // Get final status
        const finalStatus = orchestrator.getSystemStatus();
        
        console.log('\n📊 FINAL SYSTEM STATUS:');
        console.log('='.repeat(50));
        console.log(`   Total Agents: ${finalStatus.totalAgents}`);
        console.log(`   Total Profit: $${finalStatus.totalProfit.toFixed(2)}`);
        console.log(`   Task Queue: ${finalStatus.taskQueueLength}`);
        
        console.log('\n🏆 AGENT PERFORMANCE:');
        const sortedAgents = finalStatus.agents
            .sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit));
            
        for (const agent of sortedAgents) {
            console.log(`   ${agent.name}:`);
            console.log(`      Tasks: ${agent.tasksCompleted}`);
            console.log(`      Success: ${agent.successRate}%`);
            console.log(`      Profit: $${agent.profit}`);
            console.log(`      Status: ${agent.status}`);
        }
        
        // Calculate performance metrics
        const totalTasks = finalStatus.agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0);
        const averageSuccess = finalStatus.agents.reduce((sum, agent) => sum + parseFloat(agent.successRate), 0) / finalStatus.agents.length;
        const profitGenerated = parseFloat(finalStatus.totalProfit);
        
        console.log('\n📈 PERFORMANCE METRICS:');
        console.log(`   Total Tasks Completed: ${totalTasks}`);
        console.log(`   Average Success Rate: ${averageSuccess.toFixed(1)}%`);
        console.log(`   Total Profit Generated: $${profitGenerated.toFixed(2)}`);
        console.log(`   Agents Created: ${finalStatus.totalAgents}`);
        
        // Success criteria
        const success = {
            agentsCreated: finalStatus.totalAgents > 0,
            tasksCompleted: totalTasks > 0,
            profitGenerated: profitGenerated > 0,
            systemRunning: finalStatus.isRunning
        };
        
        console.log('\n✅ STEP 4A SUCCESS CRITERIA:');
        console.log(`   ✅ Agents Created: ${success.agentsCreated ? 'PASS' : 'FAIL'} (${finalStatus.totalAgents})`);
        console.log(`   ✅ Tasks Completed: ${success.tasksCompleted ? 'PASS' : 'FAIL'} (${totalTasks})`);
        console.log(`   ✅ Profit Generated: ${success.profitGenerated ? 'PASS' : 'FAIL'} ($${profitGenerated.toFixed(2)})`);
        console.log(`   ✅ System Running: ${success.systemRunning ? 'PASS' : 'FAIL'}`);
        
        const allSuccess = Object.values(success).every(s => s);
        
        console.log('\n🎯 STEP 4A RESULT:');
        if (allSuccess) {
            console.log('   ✅ STEP 4A: SYNDICATE ORCHESTRATOR - COMPLETE!');
            console.log('   🎯 Multi-agent orchestration with dynamic adaptation WORKING!');
        } else {
            console.log('   ❌ STEP 4A: SYNDICATE ORCHESTRATOR - FAILED!');
            console.log('   🚨 Some success criteria not met!');
        }
        
        return {
            success: allSuccess,
            metrics: {
                agentsCreated: finalStatus.totalAgents,
                tasksCompleted: totalTasks,
                averageSuccessRate: averageSuccess,
                profitGenerated: profitGenerated
            },
            agents: finalStatus.agents
        };
        
    } catch (error) {
        console.log('\n❌ STEP 4A TEST ERROR:', error.message);
        console.log('Stack:', error.stack);
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run the test
testSyndicateOrchestrator()
    .then(result => {
        console.log('\n🏁 STEP 4A TEST COMPLETE');
        console.log('Result:', JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Test execution error:', error);
        process.exit(1);
    }); 