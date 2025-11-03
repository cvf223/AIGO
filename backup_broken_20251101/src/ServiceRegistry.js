/**
 * 🗂️ SERVICE REGISTRY - CENTRAL SERVICE MANAGEMENT
 * ===============================================
 * 
 * Central registry for all superintelligence systems and services
 * Provides service discovery, dependency injection, and lifecycle management
 * 
 * @author Elite AI Syndicate - Service Architecture Team
 * @version 1.0.0 - Production Service Registry
 */

import { EventEmitter } from 'events';

/**
 * 🗂️ SERVICE REGISTRY
 * Central service management for the elite AI framework
 */
export class ServiceRegistry extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enableServiceDiscovery: true,
            enableDependencyInjection: true,
            enableLifecycleManagement: true,
            enableHealthChecking: true,
            autoStartServices: false,
            ...config
        };
        
        // Core service storage
        this.services = new Map();
        this.serviceMetadata = new Map();
        this.serviceDependencies = new Map();
        this.serviceInstances = new Map();
        
        // Service states
        this.serviceStates = new Map();
        this.initializationOrder = [];
        
        // Health monitoring
        this.healthChecks = new Map();
        this.lastHealthCheck = null;
        
        console.log('🗂️ Service Registry initialized');
    }
    
    /**
     * 📝 REGISTER SERVICE
     * ==================
     * Register a service with the registry
     */
    register(serviceName, serviceClass, metadata = {}) {
        console.log(`📝 Registering service: ${serviceName}`);
        
        this.services.set(serviceName, serviceClass);
        this.serviceMetadata.set(serviceName, {
            name: serviceName,
            type: metadata.type || 'service',
            category: metadata.category || 'general',
            priority: metadata.priority || 100,
            dependencies: metadata.dependencies || [],
            autoStart: metadata.autoStart || false,
            singleton: metadata.singleton !== false,
            healthCheck: metadata.healthCheck || null,
            registeredAt: Date.now(),
            ...metadata
        });
        
        // Track dependencies
        if (metadata.dependencies && metadata.dependencies.length > 0) {
            this.serviceDependencies.set(serviceName, metadata.dependencies);
        }
        
        this.serviceStates.set(serviceName, 'registered');
        
        console.log(`✅ Service registered: ${serviceName} (${metadata.type || 'service'})`);
        
        return this;
    }
    
    /**
     * 🏭 GET SERVICE
     * =============
     * Get or create service instance
     */
    get(serviceName, config = {}) {
        if (!this.services.has(serviceName)) {
            throw new Error(`Service not found: ${serviceName}`);
        }
        
        // Return existing instance if singleton
        const metadata = this.serviceMetadata.get(serviceName);
        if (metadata.singleton && this.serviceInstances.has(serviceName)) {
            return this.serviceInstances.get(serviceName);
        }
        
        // Create new instance
        const ServiceClass = this.services.get(serviceName);
        const instance = new ServiceClass(config);
        
        // Store instance if singleton
        if (metadata.singleton) {
            this.serviceInstances.set(serviceName, instance);
        }
        
        this.serviceStates.set(serviceName, 'instantiated');
        
        return instance;
    }
    
    /**
     * 🚀 INITIALIZE SERVICE
     * ====================
     * Initialize a service and its dependencies
     */
    async initialize(serviceName, config = {}) {
        if (!this.services.has(serviceName)) {
            throw new Error(`Cannot initialize unknown service: ${serviceName}`);
        }
        
        console.log(`🚀 Initializing service: ${serviceName}`);
        
        // Check and initialize dependencies first
        const dependencies = this.serviceDependencies.get(serviceName) || [];
        
        for (const depName of dependencies) {
            if (this.serviceStates.get(depName) !== 'initialized') {
                console.log(`   🔄 Initializing dependency: ${depName}`);
                await this.initialize(depName);
            }
        }
        
        // Get or create service instance
        const instance = this.get(serviceName, config);
        
        // Initialize if method exists
        if (typeof instance.initialize === 'function') {
            try {
                await instance.initialize();
                this.serviceStates.set(serviceName, 'initialized');
                console.log(`✅ Service initialized: ${serviceName}`);
            } catch (error) {
                console.error(`❌ Failed to initialize ${serviceName}:`, error.message);
                this.serviceStates.set(serviceName, 'failed');
                throw error;
            }
        } else {
            this.serviceStates.set(serviceName, 'initialized');
            console.log(`✅ Service ready (no initialization needed): ${serviceName}`);
        }
        
        return instance;
    }
    
    /**
     * 🔍 HAS SERVICE
     * =============
     * Check if service is registered
     */
    has(serviceName) {
        return this.services.has(serviceName);
    }
    
    /**
     * 📋 LIST SERVICES
     * ===============
     * Get list of all registered services
     */
    list() {
        return Array.from(this.services.keys()).map(serviceName => ({
            name: serviceName,
            metadata: this.serviceMetadata.get(serviceName),
            state: this.serviceStates.get(serviceName),
            hasInstance: this.serviceInstances.has(serviceName)
        }));
    }
    
    /**
     * 🏥 HEALTH CHECK
     * ===============
     * Check health of all services
     */
    async performHealthCheck() {
        console.log('🏥 Performing service health checks...');
        
        const healthStatus = new Map();
        
        for (const [serviceName, instance] of this.serviceInstances) {
            try {
                const metadata = this.serviceMetadata.get(serviceName);
                
                if (metadata.healthCheck && typeof instance[metadata.healthCheck] === 'function') {
                    const health = await instance[metadata.healthCheck]();
                    healthStatus.set(serviceName, { 
                        status: 'healthy', 
                        details: health 
                    });
                } else if (typeof instance.getStatus === 'function') {
                    const status = await instance.getStatus();
                    healthStatus.set(serviceName, { 
                        status: 'healthy', 
                        details: status 
                    });
                } else {
                    healthStatus.set(serviceName, { 
                        status: 'unknown', 
                        details: 'No health check available' 
                    });
                }
            } catch (error) {
                healthStatus.set(serviceName, { 
                    status: 'unhealthy', 
                    error: error.message 
                });
            }
        }
        
        this.lastHealthCheck = Date.now();
        this.healthChecks.set(this.lastHealthCheck, healthStatus);
        
        return healthStatus;
    }
    
    /**
     * 📊 GET REGISTRY STATUS
     * =====================
     * Get overall registry status
     */
    getStatus() {
        const totalServices = this.services.size;
        const initializedServices = Array.from(this.serviceStates.values())
            .filter(state => state === 'initialized').length;
        const failedServices = Array.from(this.serviceStates.values())
            .filter(state => state === 'failed').length;
            
        return {
            totalServices,
            initializedServices,
            failedServices,
            healthyServices: totalServices - failedServices,
            lastHealthCheck: this.lastHealthCheck,
            serviceStates: Object.fromEntries(this.serviceStates),
            operationalPercentage: Math.round((initializedServices / totalServices) * 100)
        };
    }
    
    /**
     * 🛑 SHUTDOWN
     * ===========
     * Shutdown all services gracefully
     */
    async shutdown() {
        console.log('🛑 Shutting down all services...');
        
        for (const [serviceName, instance] of this.serviceInstances) {
            try {
                if (typeof instance.shutdown === 'function') {
                    await instance.shutdown();
                    console.log(`   ✅ ${serviceName} shutdown complete`);
                }
            } catch (error) {
                console.error(`   ❌ Failed to shutdown ${serviceName}:`, error.message);
            }
        }
        
        this.services.clear();
        this.serviceInstances.clear();
        this.serviceStates.clear();
        
        console.log('✅ Service Registry shutdown complete');
    }
}

// Export singleton instance for global use
export const serviceRegistry = new ServiceRegistry();
export default ServiceRegistry;
