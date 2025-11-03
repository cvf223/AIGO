/**
 * 🔧 DELAYED BACKGROUND TASKS PATCH
 * =================================
 * 
 * Patches all systems to delay background task startup until
 * the system is fully initialized to prevent database errors.
 */

export function applyDelayedTasksPatch() {
    console.log('🔧 Applying delayed background tasks patch...');
    
    // Override setInterval globally to check if system is ready
    const originalSetInterval = global.setInterval;
    
    global.setInterval = function(callback, delay, ...args) {
        // Check if this is a background task that needs database
        const stack = new Error().stack;
        const needsDelay = stack.includes('EliteMemoryPersistence') ||
                          stack.includes('QuantumEntanglement') ||
                          stack.includes('MemorySinkPrevention') ||
                          stack.includes('IntegrateAdvancedMemory') ||
                          stack.includes('SharedMemory') ||
                          stack.includes('AdaptiveLearning');
        
        if (needsDelay && (!global.backgroundTaskManager || !global.backgroundTaskManager.isSystemReady)) {
            // Register task with background manager instead
            if (global.backgroundTaskManager) {
                const taskName = stack.match(/at (\w+)\./)?.[1] || 'UnknownTask';
                
                global.backgroundTaskManager.registerTask(taskName, {
                    interval: delay,
                    handler: async () => {
                        try {
                            await callback(...args);
                        } catch (error) {
                            console.error(`Background task error [${taskName}]:`, error.message);
                        }
                    },
                    requiresDB: true
                });
                
                console.log(`   📋 Background task '${taskName}' registered for delayed start`);
                
                // Return a fake timer ID
                return Symbol('delayedTimer');
            }
        }
        
        // Normal setInterval for non-background tasks
        return originalSetInterval.call(this, callback, delay, ...args);
    };
    
    console.log('   ✅ Background tasks patch applied');
}

/**
 * 🔧 Add database null guards to a class instance
 */
export function addDatabaseNullGuards(instance) {
    // Wrap all database query methods
    const methods = ['query', 'connect', 'execute'];
    
    for (const method of methods) {
        if (instance.db && typeof instance.db[method] === 'function') {
            const original = instance.db[method].bind(instance.db);
            
            instance.db[method] = async function(...args) {
                // Check if database is available
                if (!instance.db || typeof instance.db[method] !== 'function') {
                    console.warn(`⚠️ Database unavailable for ${method} - using fallback`);
                    return null;
                }
                
                try {
                    return await original(...args);
                } catch (error) {
                    if (error.code === '28P01' || error.code === 'ECONNREFUSED') {
                        console.warn(`⚠️ Database connection error in ${method} - using fallback`);
                        return null;
                    }
                    throw error;
                }
            };
        }
    }
}

/**
 * 🔧 Wrap async function with database availability check
 */
export function withDatabaseCheck(fn, fallbackValue = null) {
    return async function(...args) {
        // Check if database is available via global manager
        if (global.dbConnectionManager && !global.dbConnectionManager.isAvailable()) {
            console.warn(`⚠️ Database unavailable for ${fn.name} - using fallback`);
            return fallbackValue;
        }
        
        try {
            return await fn.apply(this, args);
        } catch (error) {
            if (error.code === '28P01' || error.code === 'ECONNREFUSED') {
                console.warn(`⚠️ Database error in ${fn.name}: ${error.message}`);
                return fallbackValue;
            }
            throw error;
        }
    };
}
