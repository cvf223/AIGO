/**
 * 🔄 LAZY MODULE LOADER - TOP 1% EXPERT IMPLEMENTATION
 * =====================================================
 * 
 * Production-grade lazy loading system with circular dependency detection
 * Prevents initialization loops and optimizes startup performance
 * 
 * FEATURES:
 * - Lazy loading with intelligent caching
 * - Circular dependency detection and breaking
 * - Performance monitoring and metrics
 * - Error boundaries for safe module loading
 * - Dependency graph visualization
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export class LazyModuleLoader extends EventEmitter {
    constructor() {
        super();
        
        // Module cache
        this.moduleCache = new Map();
        
        // Loading state tracking
        this.loadingModules = new Set();
        
        // Dependency graph
        this.dependencyGraph = new Map();
        
        // Performance metrics
        this.loadMetrics = new Map();
        
        // Circular dependency detection
        this.circularDependencies = new Set();
        
        // Module aliases for common imports
        this.moduleAliases = new Map();
        
        // Initialize with built-in modules that should never be lazy-loaded
        this.coreModules = new Set([
            'events', 'path', 'url', 'fs', 'crypto', 
            'stream', 'util', 'buffer', 'process', 'os'
        ]);
        
        // Track initialization state
        this.isInitialized = false;
        
        console.log('🔄 LazyModuleLoader initialized');
    }
    
    /**
     * 🚀 Load module lazily with circular dependency detection
     */
    async loadModule(modulePath, options = {}) {
        const startTime = performance.now();
        
        // Normalize the module path - ensure it's relative to project root
        const normalizedPath = this.normalizeModulePath(modulePath);
        
        // Check cache first
        if (this.moduleCache.has(normalizedPath)) {
            const cached = this.moduleCache.get(normalizedPath);
            this.updateMetrics(normalizedPath, performance.now() - startTime, true);
            return cached;
        }
        
        // Check if this is a circular dependency
        if (this.loadingModules.has(normalizedPath)) {
            console.warn(`⚠️ Circular dependency detected: ${normalizedPath}`);
            this.circularDependencies.add(normalizedPath);
            
            // Return a proxy that will be resolved later
            const proxy = this.createLazyProxy(normalizedPath);
            this.emit('circularDependency', { modulePath: normalizedPath, proxy });
            return proxy;
        }
        
        // Mark as loading
        this.loadingModules.add(normalizedPath);
        
        try {
            // Add to dependency graph
            this.updateDependencyGraph(normalizedPath, options.parent);
            
            // Load the module
            console.log(`📦 Lazy loading: ${normalizedPath}`);
            const module = await import(normalizedPath);
            
            // Cache the loaded module
            this.moduleCache.set(normalizedPath, module);
            
            // Update metrics
            const loadTime = performance.now() - startTime;
            this.updateMetrics(normalizedPath, loadTime, false);
            
            console.log(`✅ Loaded ${normalizedPath} in ${loadTime.toFixed(2)}ms`);
            
            // Emit load event
            this.emit('moduleLoaded', { 
                modulePath: normalizedPath, 
                loadTime,
                cacheSize: this.moduleCache.size 
            });
            
            return module;
            
        } catch (error) {
            console.error(`❌ Failed to load ${normalizedPath}:`, error.message);
            
            // Emit error event
            this.emit('loadError', { modulePath: normalizedPath, error });
            
            // Re-throw for caller to handle
            throw error;
            
        } finally {
            // Always remove from loading set
            this.loadingModules.delete(normalizedPath);
        }
    }
    
    /**
     * 🎯 Normalize module path to be relative to LazyModuleLoader location
     */
    normalizeModulePath(modulePath) {
        // If it's already an absolute path, return as-is
        if (modulePath.startsWith('/')) {
            return modulePath;
        }
        
        // If it starts with ./src/, we need to go back to project root from src/utils/
        if (modulePath.startsWith('./src/')) {
            // From src/utils/ we need to go ../../src/
            return `../../${modulePath.substring(2)}`;
        }
        
        // If it starts with src/, make it relative from src/utils/
        if (modulePath.startsWith('src/')) {
            // From src/utils/ we need to go ../../src/
            return `../../${modulePath}`;
        }
        
        // If it starts with ./, assume it's relative to project root
        if (modulePath.startsWith('./')) {
            // From src/utils/ we need to go ../../
            return `../../${modulePath.substring(2)}`;
        }
        
        // For learning/ and other root-level directories
        if (modulePath.includes('/') && !modulePath.startsWith('.')) {
            // From src/utils/ we need to go ../../
            return `../../${modulePath}`;
        }
        
        // For other paths, return as-is
        return modulePath;
    }
    
    /**
     * 🎯 Create lazy proxy for circular dependencies
     */
    createLazyProxy(modulePath) {
        const self = this;
        const handler = {
            get(target, property) {
                // Check if module is now loaded
                if (self.moduleCache.has(modulePath)) {
                    const module = self.moduleCache.get(modulePath);
                    return module[property];
                }
                
                // Return a function that will retry later
                return function lazyCircularReference(...args) {
                    console.warn(`⚠️ Attempting to use circular dependency: ${modulePath}.${String(property)}`);
                    
                    // Try to load it now if not loading
                    if (!self.loadingModules.has(modulePath)) {
                        const module = self.moduleCache.get(modulePath);
                        if (module && module[property]) {
                            return module[property](...args);
                        }
                    }
                    
                    // Return undefined as fallback
                    return undefined;
                };
            }
        };
        
        return new Proxy({}, handler);
    }
    
    /**
     * 📊 Update dependency graph
     */
    updateDependencyGraph(modulePath, parent) {
        if (!this.dependencyGraph.has(modulePath)) {
            this.dependencyGraph.set(modulePath, new Set());
        }
        
        if (parent) {
            const dependencies = this.dependencyGraph.get(parent) || new Set();
            dependencies.add(modulePath);
            this.dependencyGraph.set(parent, dependencies);
        }
    }
    
    /**
     * 📈 Update performance metrics
     */
    updateMetrics(modulePath, loadTime, fromCache) {
        const metrics = this.loadMetrics.get(modulePath) || {
            totalLoads: 0,
            cacheHits: 0,
            totalTime: 0,
            avgTime: 0
        };
        
        metrics.totalLoads++;
        if (fromCache) metrics.cacheHits++;
        metrics.totalTime += loadTime;
        metrics.avgTime = metrics.totalTime / metrics.totalLoads;
        
        this.loadMetrics.set(modulePath, metrics);
    }
    
    /**
     * 🔍 Detect circular dependencies in dependency graph
     */
    detectCircularDependencies() {
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];
        
        const dfs = (node, path = []) => {
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            
            const dependencies = this.dependencyGraph.get(node) || new Set();
            
            for (const dep of dependencies) {
                if (!visited.has(dep)) {
                    dfs(dep, [...path]);
                } else if (recursionStack.has(dep)) {
                    // Found a cycle
                    const cycleStart = path.indexOf(dep);
                    const cycle = path.slice(cycleStart);
                    cycle.push(dep);
                    cycles.push(cycle);
                    
                    console.warn(`🔄 Circular dependency detected: ${cycle.join(' -> ')}`);
                }
            }
            
            recursionStack.delete(node);
        };
        
        // Run DFS from all nodes
        for (const node of this.dependencyGraph.keys()) {
            if (!visited.has(node)) {
                dfs(node);
            }
        }
        
        return cycles;
    }
    
    /**
     * 🎨 Visualize dependency graph (for debugging)
     */
    visualizeDependencyGraph() {
        console.log('\n🎨 DEPENDENCY GRAPH:');
        console.log('===================');
        
        for (const [module, dependencies] of this.dependencyGraph) {
            if (dependencies.size > 0) {
                console.log(`\n${module}:`);
                for (const dep of dependencies) {
                    const isCircular = this.circularDependencies.has(dep);
                    const marker = isCircular ? '🔄' : '→';
                    console.log(`  ${marker} ${dep}`);
                }
            }
        }
        
        console.log('\n📊 METRICS:');
        console.log('===========');
        console.log(`Total modules loaded: ${this.moduleCache.size}`);
        console.log(`Circular dependencies: ${this.circularDependencies.size}`);
        
        // Show top 5 slowest modules
        const sortedMetrics = Array.from(this.loadMetrics.entries())
            .sort((a, b) => b[1].avgTime - a[1].avgTime)
            .slice(0, 5);
        
        if (sortedMetrics.length > 0) {
            console.log('\n🐌 Slowest modules:');
            for (const [module, metrics] of sortedMetrics) {
                console.log(`  ${module}: ${metrics.avgTime.toFixed(2)}ms avg`);
            }
        }
    }
    
    /**
     * 🧹 Clear cache for specific module or all modules
     */
    clearCache(modulePath = null) {
        if (modulePath) {
            this.moduleCache.delete(modulePath);
            console.log(`🧹 Cleared cache for: ${modulePath}`);
        } else {
            const size = this.moduleCache.size;
            this.moduleCache.clear();
            console.log(`🧹 Cleared entire cache (${size} modules)`);
        }
    }
    
    /**
     * 📦 Preload critical modules
     */
    async preloadModules(modulePaths) {
        console.log(`📦 Preloading ${modulePaths.length} critical modules...`);
        
        const results = await Promise.allSettled(
            modulePaths.map(path => this.loadModule(path, { preload: true }))
        );
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        console.log(`✅ Preloaded ${successful} modules, ${failed} failed`);
        
        return { successful, failed, results };
    }
    
    /**
     * 🔧 Create module loader function with automatic caching
     */
    createLoader(basePath = '') {
        const self = this;
        
        return async function lazyLoad(modulePath) {
            const fullPath = basePath ? `${basePath}/${modulePath}` : modulePath;
            return await self.loadModule(fullPath);
        };
    }
    
    /**
     * 🎯 Register module alias for common imports
     */
    registerAlias(alias, actualPath) {
        this.moduleAliases.set(alias, actualPath);
        console.log(`🏷️ Registered alias: ${alias} -> ${actualPath}`);
    }
    
    /**
     * 🚀 Resolve module path (with alias support)
     */
    resolveModulePath(modulePath) {
        // Check if it's an alias
        if (this.moduleAliases.has(modulePath)) {
            return this.moduleAliases.get(modulePath);
        }
        
        // Return as-is
        return modulePath;
    }
    
    /**
     * 📊 Get loading statistics
     */
    getStatistics() {
        return {
            totalModules: this.moduleCache.size,
            circularDependencies: this.circularDependencies.size,
            currentlyLoading: this.loadingModules.size,
            performanceMetrics: Object.fromEntries(this.loadMetrics),
            dependencyGraphSize: this.dependencyGraph.size,
            cacheMemoryEstimate: this.estimateCacheMemory()
        };
    }
    
    /**
     * 💾 Estimate cache memory usage
     */
    estimateCacheMemory() {
        // Rough estimate - 10KB average per module
        const avgModuleSize = 10 * 1024; // 10KB
        return this.moduleCache.size * avgModuleSize;
    }
    
    /**
     * 🛡️ Safe shutdown
     */
    shutdown() {
        console.log('🛑 Shutting down LazyModuleLoader...');
        
        // Clear all caches
        this.clearCache();
        
        // Clear tracking
        this.loadingModules.clear();
        this.dependencyGraph.clear();
        this.loadMetrics.clear();
        this.circularDependencies.clear();
        
        // Remove all listeners
        this.removeAllListeners();
        
        console.log('✅ LazyModuleLoader shutdown complete');
    }
}

// Create singleton instance
export const moduleLoader = new LazyModuleLoader();

// Export convenience function
export async function lazyLoad(modulePath, options = {}) {
    return await moduleLoader.loadModule(modulePath, options);
}

// Export circular dependency detector
export function detectCircularDependencies() {
    return moduleLoader.detectCircularDependencies();
}

// Export visualization function
export function visualizeDependencies() {
    moduleLoader.visualizeDependencyGraph();
}
