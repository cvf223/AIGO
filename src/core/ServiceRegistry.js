/**
 * 🏛️ SERVICE REGISTRY - DEPENDENCY INJECTION PATTERN
 * ==================================================
 * 
 * Central registry for all services with dependency injection
 * Prevents circular dependencies and enables clean architecture
 * 
 * FEATURES:
 * - Service registration with lifecycle management
 * - Dependency injection with automatic resolution
 * - Circular dependency prevention
 * - Service health monitoring
 * - Lazy initialization support
 */

import { EventEmitter } from 'events';

export class ServiceRegistry extends EventEmitter {
    constructor() {
        super();
        
        // Service storage
        this.services = new Map();
        
        // Service factories for lazy initialization
        this.factories = new Map();
        
        // Service dependencies mapping
        this.dependencies = new Map();
        
        // Initialization state
        this.initializationState = new Map();
        
        // Service metadata
        this.metadata = new Map();
        
        // Health check intervals
        this.healthChecks = new Map();
        
        // Initialize with lifecycle states
        this.STATES = {
            REGISTERED: 'registered',
            INITIALIZING: 'initializing',
            READY: 'ready',
            ERROR: 'error',
            SHUTDOWN: 'shutdown'
        };
        
        // Services allowed in observation mode
        this.allowedInObservation = new Set([
            'systemHealthReporter',
            'onDemandActivator',
            'observationModeEnforcer',
            'database',
            'dbPool'
        ]);
        
        // Import and initialize service blacklist
        this.serviceBlacklist = null;
        this.initializeBlacklist();
        
        console.log('🏛️ ServiceRegistry initialized');
    }
    
    /**
     * Initialize service blacklist
     */
    async initializeBlacklist() {
        try {
            const { serviceBlacklist } = await import('./ServiceBlacklist.js');
            this.serviceBlacklist = serviceBlacklist;
            console.log(`🚫 Service blacklist loaded (mode: ${serviceBlacklist.currentMode})`);
        } catch (error) {
            console.warn('⚠️ Could not load service blacklist:', error.message);
            this.serviceBlacklist = {
                isBlacklisted: () => false,
                createStubService: (name) => ({ disabled: true, name })
            };
        }
    }
    
    /**
     * Check if service is allowed in observation mode
     */
    isAllowedInObservation(serviceName) {
        return this.allowedInObservation.has(serviceName);
    }
    
    /**
     * Check if service is blacklisted for current mode
     */
    isServiceBlacklisted(serviceName) {
        if (!this.serviceBlacklist) {
            return false;
        }
        return this.serviceBlacklist.isBlacklisted(serviceName);
    }
    
    /**
     * 📝 Register a service with optional factory
     */
    register(name, serviceOrFactory, options = {}) {
        // ⚠️ CRITICAL: Check blacklist and observation mode BEFORE registering
        
        // Check service blacklist first
        if (this.isServiceBlacklisted(name)) {
            console.log(`🚫 ServiceRegistry: Service '${name}' blacklisted for current mode`);
            const stub = this.serviceBlacklist.createStubService(name, 'blacklisted for current mode');
            this.services.set(name, stub);
            return true;
        }
        
        // Check observation mode restrictions
        if (global.SKIP_ALL_SERVICES && !this.isAllowedInObservation(name)) {
            console.log(`🔭 ServiceRegistry: Skipping ${name} in observation mode`);
            const stub = this.serviceBlacklist?.createStubService(name, 'disabled in observation mode') || {
                disabled: true, 
                name,
                message: 'Service disabled in observation mode'
            };
            this.services.set(name, stub);
            return true; // Return success to prevent errors
        }
        
        if (this.services.has(name) || this.factories.has(name)) {
            console.warn(`⚠️ Service ${name} already registered`);
            return false;
        }
        
        // Store metadata
        this.metadata.set(name, {
            registeredAt: Date.now(),
            dependencies: options.dependencies || [],
            singleton: options.singleton !== false,
            lazy: options.lazy === true,
            critical: options.critical === true,
            healthCheck: options.healthCheck || null,
            ...options
        });
        
        // Store dependencies for resolution
        if (options.dependencies) {
            this.dependencies.set(name, options.dependencies);
        }
        
        // If lazy, store factory; otherwise store instance
        if (options.lazy || typeof serviceOrFactory === 'function') {
            this.factories.set(name, serviceOrFactory);
            this.initializationState.set(name, this.STATES.REGISTERED);
            console.log(`📝 Registered lazy service: ${name}`);
        } else {
            this.services.set(name, serviceOrFactory);
            this.initializationState.set(name, this.STATES.READY);
            console.log(`📝 Registered service: ${name}`);
        }
        
        // Setup health check if provided
        if (options.healthCheck) {
            this.setupHealthCheck(name, options.healthCheck);
        }
        
        this.emit('serviceRegistered', { name, options });
        return true;
    }
    
    /**
     * 🎯 Get service with automatic dependency resolution
     */
    async get(name, options = {}) {
        // Check if already initialized
        if (this.services.has(name)) {
            return this.services.get(name);
        }
        
        // Check if factory exists
        if (!this.factories.has(name)) {
            if (options.optional) {
                return null;
            }
            throw new Error(`Service ${name} not registered`);
        }
        
        // Initialize if needed
        return await this.initialize(name);
    }
    
    /**
     * 🚀 Initialize service with dependency resolution
     */
    async initialize(name, visitedServices = new Set()) {
        // Circular dependency check
        if (visitedServices.has(name)) {
            const cycle = Array.from(visitedServices).concat(name).join(' -> ');
            throw new Error(`Circular dependency detected: ${cycle}`);
        }
        
        // Check if already initializing
        const state = this.initializationState.get(name);
        if (state === this.STATES.INITIALIZING) {
            console.warn(`⚠️ Service ${name} is already initializing`);
            
            // Wait for initialization to complete
            return await this.waitForService(name);
        }
        
        // Check if already ready
        if (state === this.STATES.READY) {
            return this.services.get(name);
        }
        
        // Mark as initializing
        this.initializationState.set(name, this.STATES.INITIALIZING);
        visitedServices.add(name);
        
        try {
            console.log(`🚀 Initializing service: ${name}`);
            
            // Resolve dependencies first
            const dependencies = await this.resolveDependencies(name, visitedServices);
            
            // Get factory
            const factory = this.factories.get(name);
            
            // Create service instance
            let service;
            if (typeof factory === 'function') {
                // Call factory with resolved dependencies
                service = await factory(dependencies, this);
            } else {
                service = factory;
            }
            
            // Initialize if it has an initialize method
            if (service && typeof service.initialize === 'function') {
                await service.initialize(dependencies);
            }
            
            // Store initialized service
            this.services.set(name, service);
            this.initializationState.set(name, this.STATES.READY);
            
            console.log(`✅ Service initialized: ${name}`);
            this.emit('serviceInitialized', { name, service });
            
            return service;
            
        } catch (error) {
            console.error(`❌ Failed to initialize service ${name}:`, error);
            this.initializationState.set(name, this.STATES.ERROR);
            this.emit('serviceError', { name, error });
            throw error;
        }
    }
    
    /**
     * 🔗 Resolve service dependencies
     */
    async resolveDependencies(serviceName, visitedServices) {
        const deps = this.dependencies.get(serviceName);
        if (!deps || deps.length === 0) {
            return {};
        }
        
        const resolved = {};
        
        for (const dep of deps) {
            // Handle dependency specification
            let depName = dep;
            let optional = false;
            
            if (typeof dep === 'object') {
                depName = dep.name;
                optional = dep.optional || false;
            }
            
            try {
                // Recursively initialize dependency
                const depService = await this.initialize(depName, new Set(visitedServices));
                resolved[depName] = depService;
            } catch (error) {
                if (!optional) {
                    throw error;
                }
                console.warn(`⚠️ Optional dependency ${depName} failed to load`);
                resolved[depName] = null;
            }
        }
        
        return resolved;
    }
    
    /**
     * ⏱️ Wait for service to be ready
     */
    async waitForService(name, timeout = 30000) {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const checkInterval = setInterval(() => {
                const state = this.initializationState.get(name);
                
                if (state === this.STATES.READY) {
                    clearInterval(checkInterval);
                    resolve(this.services.get(name));
                } else if (state === this.STATES.ERROR) {
                    clearInterval(checkInterval);
                    reject(new Error(`Service ${name} failed to initialize`));
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(checkInterval);
                    reject(new Error(`Timeout waiting for service ${name}`));
                }
            }, 100);
        });
    }
    
    /**
     * 🏗️ Register multiple services at once
     */
    async registerBatch(serviceDefinitions) {
        const results = [];
        
        for (const [name, definition] of Object.entries(serviceDefinitions)) {
            try {
                const { factory, ...options } = definition;
                this.register(name, factory, options);
                results.push({ name, success: true });
            } catch (error) {
                results.push({ name, success: false, error });
            }
        }
        
        return results;
    }
    
    /**
     * 💉 Create dependency injector function
     */
    createInjector(dependencies = []) {
        return async () => {
            const resolved = {};
            
            for (const dep of dependencies) {
                const depName = typeof dep === 'string' ? dep : dep.name;
                resolved[depName] = await this.get(depName, { optional: dep.optional });
            }
            
            return resolved;
        };
    }
    
    /**
     * 🏥 Setup health check for service
     */
    setupHealthCheck(name, checkFunction) {
        const interval = setInterval(async () => {
            try {
                const service = this.services.get(name);
                if (!service) return;
                
                const health = await checkFunction(service);
                this.emit('healthCheck', { name, health });
                
                if (!health.healthy) {
                    console.warn(`⚠️ Service ${name} unhealthy:`, health.reason);
                }
            } catch (error) {
                console.error(`❌ Health check failed for ${name}:`, error);
            }
        }, 30000); // Every 30 seconds
        
        this.healthChecks.set(name, interval);
    }
    
    /**
     * 📊 Get service statistics
     */
    getStatistics() {
        const stats = {
            totalRegistered: this.factories.size + this.services.size,
            initialized: 0,
            ready: 0,
            error: 0,
            services: {}
        };
        
        for (const [name, state] of this.initializationState) {
            stats.services[name] = state;
            
            if (state === this.STATES.READY) stats.ready++;
            else if (state === this.STATES.ERROR) stats.error++;
            else if (state === this.STATES.INITIALIZING) stats.initialized++;
        }
        
        return stats;
    }
    
    /**
     * 🔍 Check if service exists
     */
    has(name) {
        return this.services.has(name) || this.factories.has(name);
    }
    
    /**
     * 🗑️ Unregister service
     */
    async unregister(name) {
        const service = this.services.get(name);
        
        // Shutdown service if it has shutdown method
        if (service && typeof service.shutdown === 'function') {
            await service.shutdown();
        }
        
        // Clear health check
        const healthInterval = this.healthChecks.get(name);
        if (healthInterval) {
            clearInterval(healthInterval);
            this.healthChecks.delete(name);
        }
        
        // Remove from registries
        this.services.delete(name);
        this.factories.delete(name);
        this.dependencies.delete(name);
        this.metadata.delete(name);
        this.initializationState.delete(name);
        
        console.log(`🗑️ Unregistered service: ${name}`);
        this.emit('serviceUnregistered', { name });
    }
    
    /**
     * 🔄 Reset service (re-initialize)
     */
    async reset(name) {
        console.log(`🔄 Resetting service: ${name}`);
        
        // Get factory before unregistering
        const factory = this.factories.get(name);
        const metadata = this.metadata.get(name);
        
        if (!factory) {
            throw new Error(`Cannot reset non-lazy service: ${name}`);
        }
        
        // Unregister
        await this.unregister(name);
        
        // Re-register
        this.register(name, factory, metadata);
        
        // Re-initialize
        return await this.initialize(name);
    }
    
    /**
     * 🛑 Shutdown all services
     */
    async shutdown() {
        console.log('🛑 Shutting down all services...');
        
        const shutdownOrder = this.getShutdownOrder();
        
        for (const name of shutdownOrder) {
            try {
                await this.unregister(name);
            } catch (error) {
                console.error(`❌ Error shutting down ${name}:`, error);
            }
        }
        
        // Clear all remaining data
        this.services.clear();
        this.factories.clear();
        this.dependencies.clear();
        this.metadata.clear();
        this.initializationState.clear();
        this.healthChecks.clear();
        
        console.log('✅ ServiceRegistry shutdown complete');
    }
    
    /**
     * 📋 Get shutdown order (reverse dependency order)
     */
    getShutdownOrder() {
        const visited = new Set();
        const order = [];
        
        const visit = (name) => {
            if (visited.has(name)) return;
            visited.add(name);
            
            // Visit dependents first
            for (const [service, deps] of this.dependencies) {
                if (deps.includes(name)) {
                    visit(service);
                }
            }
            
            order.push(name);
        };
        
        // Visit all services
        for (const name of this.services.keys()) {
            visit(name);
        }
        
        return order;
    }
    
    /**
     * 🎨 Visualize service dependencies
     */
    visualizeDependencies() {
        console.log('\n🎨 SERVICE DEPENDENCY GRAPH:');
        console.log('============================');
        
        for (const [service, deps] of this.dependencies) {
            const state = this.initializationState.get(service);
            const stateEmoji = {
                [this.STATES.READY]: '✅',
                [this.STATES.ERROR]: '❌',
                [this.STATES.INITIALIZING]: '🔄',
                [this.STATES.REGISTERED]: '📝'
            }[state] || '❓';
            
            console.log(`\n${stateEmoji} ${service}:`);
            
            for (const dep of deps) {
                const depName = typeof dep === 'string' ? dep : dep.name;
                const optional = typeof dep === 'object' && dep.optional ? '(optional)' : '';
                console.log(`  → ${depName} ${optional}`);
            }
        }
        
        const stats = this.getStatistics();
        console.log('\n📊 STATISTICS:');
        console.log(`Total services: ${stats.totalRegistered}`);
        console.log(`Ready: ${stats.ready}`);
        console.log(`Error: ${stats.error}`);
    }
}

// Create singleton instance
export const serviceRegistry = new ServiceRegistry();

// Export convenience functions
export function registerService(name, serviceOrFactory, options) {
    return serviceRegistry.register(name, serviceOrFactory, options);
}

export async function getService(name, options) {
    return await serviceRegistry.get(name, options);
}

export function createServiceInjector(dependencies) {
    return serviceRegistry.createInjector(dependencies);
}
