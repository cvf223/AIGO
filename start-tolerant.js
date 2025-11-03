#!/usr/bin/env node

// Enhanced error handling
process.on('uncaughtException', (error) => {
    console.error('⚠️ Uncaught Exception (handled):', error.message);
    console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection (handled) at:', promise, 'reason:', reason);
});

// Set environment for maximum tolerance
process.env.NODE_ENV = 'production';
process.env.SKIP_OLLAMA = 'true'; // Skip if Ollama has issues
process.env.CONTINUE_ON_ERROR = 'true';

// Import and start
import('./startfullsyndicate.js').then(async (module) => {
    console.log('✅ Module loaded successfully');
    
    // If there's a main function, call it
    if (module.main) {
        await module.main();
    }
}).catch(error => {
    console.error('❌ Failed to load main module:', error.message);
    console.error(error.stack);
});

// Keep process alive
setInterval(() => {
    console.log('💓 Construction Syndicate heartbeat -', new Date().toISOString());
}, 60000); // Every minute
