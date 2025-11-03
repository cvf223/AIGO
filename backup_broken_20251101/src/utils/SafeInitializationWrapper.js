/**
 * 🛡️ SAFE INITIALIZATION WRAPPER
 * ===============================
 * 
 * Wraps system initialization with comprehensive error handling
 * Prevents null reference cascades and unhandled rejections
 */

export function wrapSystemInitialization(system, systemName) {
    const originalInitialize = system.initialize?.bind(system);
    
    if (!originalInitialize) return system;
    
    system.initialize = async function(...args) {
        try {
            // Add dependency checks
            if (this.dbPool && !this.dbPool.connect) {
                console.warn(`⚠️ ${systemName}: Invalid dbPool - using fallback`);
                this.dbPool = null;
            }
            
            // Call original
            return await originalInitialize(...args);
            
        } catch (error) {
            console.error(`❌ ${systemName} initialization failed:`, error.message);
            console.warn(`   ⏭️ ${systemName}: Continuing with degraded functionality`);
            
            // Don't throw - allow system to continue
            return false;
        }
    };
    
    return system;
}

export function wrapBackgroundTask(handler, taskName) {
    return async function() {
        try {
            await handler();
        } catch (error) {
            console.error(`❌ Background task [${taskName}]:`, error.message);
            // Don't crash - just log and continue
        }
    };
}

export function createSafeTimer(handler, interval, taskName) {
    let errorCount = 0;
    const maxErrors = 10;
    
    const safeHandler = async () => {
        try {
            await handler();
            errorCount = 0; // Reset on success
        } catch (error) {
            errorCount++;
            console.error(`❌ Timer task [${taskName}] error ${errorCount}/${maxErrors}:`, error.message);
            
            if (errorCount >= maxErrors) {
                console.error(`   🛑 Timer disabled after ${maxErrors} errors: ${taskName}`);
                clearInterval(intervalId);
            }
        }
    };
    
    const intervalId = setInterval(safeHandler, interval);
    return intervalId;
}

