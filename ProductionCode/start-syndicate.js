import { SyndicateOrchestrator } from './src/core/SyndicateOrchestrator.js';
import dotenv from 'dotenv';

dotenv.config();

let orchestrator;

async function startSyndicate() {
    console.log('Booting up the AI Flash Loan Arbitrage Syndicate...');

    try {
        // Initialize the new Syndicate Orchestrator
        orchestrator = new SyndicateOrchestrator();

        // Run the full initialization sequence
        const isInitialized = await orchestrator.initialize();

        if (!isInitialized) {
            throw new Error('Syndicate orchestrator initialization failed. Check logs for details.');
        }

        // Start the Syndicate's main operational loop and the Mastermind's cognitive cycle
        await orchestrator.startSyndicate();
        await orchestrator.startMasterCognitiveLoop();

        console.log('✅ Syndicate is fully operational. The pre-training and evolution phase has begun.');
        console.log('   The LLM Mastermind is now autonomous.');
        console.log('   Monitoring for opportunities and running background learning cycles...');
        console.log('   To shut down gracefully, press CTRL+C');

    } catch (error) {
        console.error('❌ A fatal error occurred during syndicate startup:', error);
        process.exit(1);
    }
}

startSyndicate();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received. Shutting down syndicate gracefully...');
    if (orchestrator) {
        await orchestrator.stopSyndicate();
    }
    process.exit(0);
});
