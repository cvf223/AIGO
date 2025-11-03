/**
 * 🚀 RESILIENT STARTUP SYSTEM
 * ===========================
 */

export class ResilientStartup {
    constructor() {
        this.services = new Map();
        this.dependencies = new Map();
        this.initialized = new Set();
    }
    
    registerService(name, initFn, dependencies = []) {
        this.services.set(name, { initFn, dependencies, retries: 0 });
        this.dependencies.set(name, dependencies);
    }
    
    async initialize() {
        const order = this.topologicalSort();
        
        for (const serviceName of order) {
            await this.initializeService(serviceName);
        }
    }
    
    async initializeService(name) {
        const service = this.services.get(name);
        if (!service) return;
        
        // Check dependencies
        for (const dep of service.dependencies) {
            if (!this.initialized.has(dep)) {
                console.warn(`⚠️ ${name}: Dependency ${dep} not ready`);
                return false;
            }
        }
        
        // Try to initialize
        try {
            await service.initFn();
            this.initialized.add(name);
            console.log(`✅ ${name} initialized`);
            return true;
        } catch (error) {
            service.retries++;
            console.error(`❌ ${name} failed (retry ${service.retries}):`, error.message);
            
            if (service.retries < 3) {
                await new Promise(r => setTimeout(r, 1000 * service.retries));
                return this.initializeService(name);
            }
            
            return false;
        }
    }
    
    topologicalSort() {
        const visited = new Set();
        const result = [];
        
        const visit = (name) => {
            if (visited.has(name)) return;
            visited.add(name);
            
            const deps = this.dependencies.get(name) || [];
            for (const dep of deps) {
                visit(dep);
            }
            
            result.push(name);
        };
        
        for (const name of this.services.keys()) {
            visit(name);
        }
        
        return result;
    }
}
