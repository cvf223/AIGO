import type { UUID, IAgentRuntime, Plugin } from '../types';

export interface BasePlugin {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly capabilities: string[];
    
    initialize(runtime: IAgentRuntime): Promise<void>;
    call(method: string, params: unknown[]): Promise<unknown>;
    healthCheck(): Promise<boolean>;
    destroy(): Promise<void>;
}

export interface PluginRegistry {
    [pluginId: string]: {
        schema: PluginSchema;
        instance: BasePlugin;
        metadata: PluginMetadata;
    };
}

export interface PluginSchema {
    methods: {
        [methodName: string]: {
            params: ParameterSchema[];
            returns: ReturnSchema;
            description: string;
            examples: unknown[];
        };
    };
    events: {
        [eventName: string]: {
            payload: unknown;
            description: string;
        };
    };
}

export interface ParameterSchema {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    description: string;
    validation?: unknown;
}

export interface ReturnSchema {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'void';
    description: string;
    schema?: unknown;
}

export interface PluginMetadata {
    priority: number;
    retryCount: number;
    timeout: number;
    rateLimit: {
        requests: number;
        window: number; // milliseconds
    };
    failoverTargets: string[];
    healthCheckInterval: number;
}

export interface PluginCallOptions {
    timeout?: number;
    retries?: number;
    failover?: boolean;
    metadata?: Record<string, unknown>;
}

export interface PluginCallResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    metadata: {
        pluginId: string;
        method: string;
        duration: number;
        attempts: number;
        cached: boolean;
    };
}

/**
 * Plugin Mesh - Normalized API layer for the Castle
 * 
 * 💡 WHY: Normalizes access to chains, web, SaaS, LLMs with fail-over capabilities
 * and provides a single interface for all external integrations.
 * 
 * ⚙️ HOW: Registry-based plugin system with automatic fail-over, rate limiting,
 * health checks, and schema validation for type safety.
 */
export class PluginMesh {
    private runtime: IAgentRuntime;
    private registry: PluginRegistry = {};
    private healthChecks: Map<string, NodeJS.Timeout> = new Map();
    private rateLimiters: Map<string, RateLimiter> = new Map();
    private circuitBreakers: Map<string, CircuitBreaker> = new Map();

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
    }

    /**
     * Register a plugin with schema validation
     */
    async registerPlugin(
        plugin: BasePlugin,
        schema: PluginSchema,
        metadata: Partial<PluginMetadata> = {}
    ): Promise<void> {
        try {
            // add logic here – validate plugin and schema
            await this.validatePlugin(plugin, schema);

            // add logic here – initialize plugin
            await plugin.initialize(this.runtime);

            // add logic here – register in registry with metadata
            const defaultMetadata: PluginMetadata = {
                priority: 1,
                retryCount: 3,
                timeout: 30000,
                rateLimit: { requests: 100, window: 60000 },
                failoverTargets: [],
                healthCheckInterval: 60000,
                ...metadata
            };

            this.registry[plugin.id] = {
                schema,
                instance: plugin,
                metadata: defaultMetadata
            };

            // add logic here – setup health checks
            this.setupHealthCheck(plugin.id);

            // add logic here – setup rate limiting
            this.setupRateLimiter(plugin.id, defaultMetadata.rateLimit);

            // add logic here – setup circuit breaker
            this.setupCircuitBreaker(plugin.id);

            console.log(`Plugin registered: ${plugin.id}`);

        } catch (error) {
            console.error(`Failed to register plugin ${plugin.id}:`, error);
            throw error;
        }
    }

    /**
     * Call plugin method with fail-over and retry logic
     */
    async call<T = unknown>(
        pluginId: string,
        method: string,
        params: unknown[] = [],
        options: PluginCallOptions = {}
    ): Promise<PluginCallResult<T>> {
        const startTime = Date.now();
        let attempts = 0;
        const maxAttempts = options.retries || this.registry[pluginId]?.metadata.retryCount || 3;

        while (attempts < maxAttempts) {
            attempts++;

            try {
                // add logic here – check if plugin exists and is healthy
                const pluginInfo = this.registry[pluginId];
                if (!pluginInfo) {
                    throw new Error(`Plugin not found: ${pluginId}`);
                }

                // add logic here – rate limiting check
                if (!this.checkRateLimit(pluginId)) {
                    throw new Error(`Rate limit exceeded for plugin: ${pluginId}`);
                }

                // add logic here – circuit breaker check
                if (!this.checkCircuitBreaker(pluginId)) {
                    throw new Error(`Circuit breaker open for plugin: ${pluginId}`);
                }

                // add logic here – validate method parameters
                await this.validateMethodCall(pluginId, method, params);

                // add logic here – execute with timeout
                const timeout = options.timeout || pluginInfo.metadata.timeout;
                const result = await this.executeWithTimeout(
                    pluginInfo.instance,
                    method,
                    params,
                    timeout
                );

                // add logic here – record success
                this.recordSuccess(pluginId);

                return {
                    success: true,
                    data: result as T,
                    metadata: {
                        pluginId,
                        method,
                        duration: Date.now() - startTime,
                        attempts,
                        cached: false
                    }
                };

            } catch (error) {
                console.error(`Plugin call failed (attempt ${attempts}):`, error);

                // add logic here – record failure
                this.recordFailure(pluginId);

                // add logic here – try failover if enabled and available
                if (options.failover && attempts === maxAttempts) {
                    const failoverResult = await this.tryFailover<T>(pluginId, method, params, options);
                    if (failoverResult) {
                        return failoverResult;
                    }
                }

                // add logic here – if last attempt, throw error
                if (attempts === maxAttempts) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        metadata: {
                            pluginId,
                            method,
                            duration: Date.now() - startTime,
                            attempts,
                            cached: false
                        }
                    };
                }

                // add logic here – exponential backoff before retry
                await this.delay(Math.pow(2, attempts - 1) * 1000);
            }
        }

        throw new Error('Unexpected end of retry loop');
    }

    /**
     * Batch call multiple plugins in parallel
     */
    async batchCall(
        calls: Array<{
            pluginId: string;
            method: string;
            params: unknown[];
            options?: PluginCallOptions;
        }>
    ): Promise<PluginCallResult[]> {
        // add logic here – execute calls in parallel with proper error handling
        const promises = calls.map(call =>
            this.call(call.pluginId, call.method, call.params, call.options)
        );

        return Promise.allSettled(promises).then(results =>
            results.map(result =>
                result.status === 'fulfilled'
                    ? result.value
                    : {
                          success: false,
                          error: result.reason,
                          metadata: {
                              pluginId: 'unknown',
                              method: 'unknown',
                              duration: 0,
                              attempts: 0,
                              cached: false
                          }
                      }
            )
        );
    }

    /**
     * Get plugin capabilities and schema
     */
    getPluginInfo(pluginId: string): {
        capabilities: string[];
        schema: PluginSchema;
        metadata: PluginMetadata;
        health: boolean;
    } | null {
        const pluginInfo = this.registry[pluginId];
        if (!pluginInfo) return null;

        return {
            capabilities: pluginInfo.instance.capabilities,
            schema: pluginInfo.schema,
            metadata: pluginInfo.metadata,
            health: this.circuitBreakers.get(pluginId)?.isHealthy() ?? false
        };
    }

    /**
     * List all registered plugins
     */
    listPlugins(): Array<{
        id: string;
        name: string;
        capabilities: string[];
        health: boolean;
    }> {
        return Object.entries(this.registry).map(([id, info]) => ({
            id,
            name: info.instance.name,
            capabilities: info.instance.capabilities,
            health: this.circuitBreakers.get(id)?.isHealthy() ?? false
        }));
    }

    /**
     * Unregister plugin and cleanup
     */
    async unregisterPlugin(pluginId: string): Promise<void> {
        const pluginInfo = this.registry[pluginId];
        if (!pluginInfo) return;

        try {
            // add logic here – cleanup health checks
            const healthCheck = this.healthChecks.get(pluginId);
            if (healthCheck) {
                clearInterval(healthCheck);
                this.healthChecks.delete(pluginId);
            }

            // add logic here – cleanup rate limiters and circuit breakers
            this.rateLimiters.delete(pluginId);
            this.circuitBreakers.delete(pluginId);

            // add logic here – destroy plugin instance
            await pluginInfo.instance.destroy();

            // add logic here – remove from registry
            delete this.registry[pluginId];

            console.log(`Plugin unregistered: ${pluginId}`);

        } catch (error) {
            console.error(`Failed to unregister plugin ${pluginId}:`, error);
            throw error;
        }
    }

    /**
     * Shutdown all plugins
     */
    async shutdown(): Promise<void> {
        const pluginIds = Object.keys(this.registry);
        await Promise.all(pluginIds.map(id => this.unregisterPlugin(id)));
    }

    // Private helper methods

    private async validatePlugin(plugin: BasePlugin, schema: PluginSchema): Promise<void> {
        // add logic here – validate plugin implements required interface
        if (!plugin.id || !plugin.name || !plugin.call) {
            throw new Error('Plugin missing required properties');
        }

        // add logic here – validate schema format
        if (!schema.methods || typeof schema.methods !== 'object') {
            throw new Error('Invalid plugin schema');
        }
    }

    private async validateMethodCall(
        pluginId: string,
        method: string,
        params: unknown[]
    ): Promise<void> {
        // add logic here – validate method exists and parameters match schema
        const pluginInfo = this.registry[pluginId];
        const methodSchema = pluginInfo.schema.methods[method];
        
        if (!methodSchema) {
            throw new Error(`Method not found: ${method} in plugin ${pluginId}`);
        }

        // add logic here – validate parameter types and requirements
        // Implement parameter validation based on schema
    }

    private async executeWithTimeout(
        plugin: BasePlugin,
        method: string,
        params: unknown[],
        timeout: number
    ): Promise<unknown> {
        // add logic here – execute with timeout wrapper
        return Promise.race([
            plugin.call(method, params),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Plugin call timeout')), timeout)
            )
        ]);
    }

    private async tryFailover<T>(
        pluginId: string,
        method: string,
        params: unknown[],
        options: PluginCallOptions
    ): Promise<PluginCallResult<T> | null> {
        // add logic here – attempt failover to backup plugins
        const pluginInfo = this.registry[pluginId];
        const failoverTargets = pluginInfo.metadata.failoverTargets;

        for (const targetId of failoverTargets) {
            try {
                console.log(`Attempting failover from ${pluginId} to ${targetId}`);
                return await this.call<T>(targetId, method, params, {
                    ...options,
                    failover: false // Prevent infinite failover loops
                });
            } catch (error) {
                console.error(`Failover to ${targetId} failed:`, error);
                continue;
            }
        }

        return null;
    }

    private setupHealthCheck(pluginId: string): void {
        const pluginInfo = this.registry[pluginId];
        const interval = pluginInfo.metadata.healthCheckInterval;

        const healthCheck = setInterval(async () => {
            try {
                const isHealthy = await pluginInfo.instance.healthCheck();
                this.updateCircuitBreakerHealth(pluginId, isHealthy);
            } catch (error) {
                console.error(`Health check failed for ${pluginId}:`, error);
                this.updateCircuitBreakerHealth(pluginId, false);
            }
        }, interval);

        this.healthChecks.set(pluginId, healthCheck);
    }

    private setupRateLimiter(pluginId: string, config: { requests: number; window: number }): void {
        this.rateLimiters.set(pluginId, new RateLimiter(config.requests, config.window));
    }

    private setupCircuitBreaker(pluginId: string): void {
        this.circuitBreakers.set(pluginId, new CircuitBreaker());
    }

    private checkRateLimit(pluginId: string): boolean {
        return this.rateLimiters.get(pluginId)?.check() ?? true;
    }

    private checkCircuitBreaker(pluginId: string): boolean {
        return this.circuitBreakers.get(pluginId)?.isHealthy() ?? true;
    }

    private recordSuccess(pluginId: string): void {
        this.circuitBreakers.get(pluginId)?.recordSuccess();
    }

    private recordFailure(pluginId: string): void {
        this.circuitBreakers.get(pluginId)?.recordFailure();
    }

    private updateCircuitBreakerHealth(pluginId: string, isHealthy: boolean): void {
        const circuitBreaker = this.circuitBreakers.get(pluginId);
        if (circuitBreaker) {
            if (isHealthy) {
                circuitBreaker.recordSuccess();
            } else {
                circuitBreaker.recordFailure();
            }
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Helper classes for rate limiting and circuit breaking

class RateLimiter {
    private requests: number[] = [];
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests: number, windowMs: number) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    check(): boolean {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        
        if (this.requests.length >= this.maxRequests) {
            return false;
        }
        
        this.requests.push(now);
        return true;
    }
}

class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private readonly failureThreshold = 5;
    private readonly timeout = 60000; // 1 minute

    recordSuccess(): void {
        this.failures = 0;
        this.state = 'CLOSED';
    }

    recordFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();
        
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }

    isHealthy(): boolean {
        if (this.state === 'CLOSED') return true;
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'HALF_OPEN';
                return true;
            }
            return false;
        }
        return true; // HALF_OPEN
    }
}

export default PluginMesh; 