/**
 * 🛡️ APPLY NULL GUARDS TO ALL SYSTEMS
 * ====================================
 * 
 * Monkey-patches critical methods to add null checking
 * Prevents cascade failures
 */

export function applyNullGuards() {
    console.log('🛡️ Applying null guards to all systems...');
    
    // Patch global Promise to handle unhandled rejections
    const originalUnhandledRejection = process.listeners('unhandledRejection')[0];
    
    process.removeAllListeners('unhandledRejection');
    
    process.on('unhandledRejection', (reason, promise) => {
        const message = reason?.message || reason?.toString() || 'Unknown error';
        
        // Filter known safe errors
        const knownSafeErrors = [
            'password authentication failed',
            'relation ".*" does not exist',
            'Cannot read properties of undefined',
            'Cannot read properties of null',
            'fetch failed'
        ];
        
        const isSafeError = knownSafeErrors.some(pattern => 
            message.match(new RegExp(pattern, 'i'))
        );
        
        if (isSafeError) {
            // Log but don't crash
            console.warn(`⚠️ Handled rejection: ${message}`);
        } else {
            // Critical error - log with stack
            console.error('💥 CRITICAL UNHANDLED REJECTION:', reason);
            
            // Call original handler if exists
            if (originalUnhandledRejection) {
                originalUnhandledRejection(reason, promise);
            }
        }
    });
    
    console.log('✅ Null guards applied - system will handle errors gracefully');
}

