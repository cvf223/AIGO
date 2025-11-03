// Helper to safely initialize systems
export async function safeInitialize(system) {
    if (system && typeof system.initialize === 'function') {
        return await system.initialize();
    }
    return Promise.resolve();
}
