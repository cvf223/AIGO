/**
 * 🔄 CIRCULAR DEPENDENCY DETECTOR - RUNTIME DETECTION
 * ==================================================
 * 
 * Monitors module imports in real-time to detect and break
 * circular dependencies before they cause initialization loops
 * 
 * FEATURES:
 * - Real-time import monitoring
 * - Automatic circular dependency breaking
 * - Detailed dependency visualization
 * - Performance impact analysis
 * - Integration with module loader
 */

import { EventEmitter } from 'events';
import Module from 'module';

export class CircularDependencyDetector extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxDepth: config.maxDepth || 50,
            breakCircularDeps: config.breakCircularDeps !== false,
            logLevel: config.logLevel || 'warn',
            enableVisualization: config.enableVisualization !== false,
            ...config
        };
        
        // Module loading stack
        this.loadingStack = [];
        
        // Detected circular dependencies
        this.circularDependencies = new Set();
        
        // Module dependency graph
        this.dependencyGraph = new Map();
        
        // Import statistics
        this.importStats = new Map();
        
        // Broken dependencies
        this.brokenDependencies = new Map();
        
        // Install hooks if enabled
        if (config.autoInstall !== false) {
            this.installHooks();
        }
        
        console.log('🔄 CircularDependencyDetector initialized');
    }
    
    /**
     * 🪝 Install module hooks to monitor imports
     */
    installHooks() {
        const self = this;
        const originalRequire = Module.prototype.require;
        
        // Override require to monitor imports
        Module.prototype.require = function(id) {
            const modulePath = Module._resolveFilename(id, this);
            
            // Track the import
            self.trackImport(this.filename, modulePath);
            
            try {
                // Check for circular dependency
                if (self.checkCircularDependency(modulePath)) {
                    if (self.config.breakCircularDeps) {
                        return self.breakCircularDependency(modulePath, originalRequire, this);
                    }
                }
                
                // Normal import
                return originalRequire.call(this, id);
                
            } finally {
                // Clean up stack
                self.loadingStack.pop();
            }
        };
        
        console.log('🪝 Module hooks installed for circular dependency detection');
    }
    
    /**
     * 📊 Track import for analysis
     */
    trackImport(from, to) {
        // Update loading stack
        this.loadingStack.push({
            from,
            to,
            timestamp: Date.now(),
            depth: this.loadingStack.length
        });
        
        // Update dependency graph
        if (!this.dependencyGraph.has(from)) {
            this.dependencyGraph.set(from, new Set());
        }
        this.dependencyGraph.get(from).add(to);
        
        // Update statistics
        const stats = this.importStats.get(to) || {
            importCount: 0,
            firstImport: Date.now(),
            lastImport: Date.now(),
            importers: new Set()
        };
        
        stats.importCount++;
        stats.lastImport = Date.now();
        stats.importers.add(from);
        
        this.importStats.set(to, stats);
        
        // Check depth
        if (this.loadingStack.length > this.config.maxDepth) {
            console.error('❌ Maximum import depth exceeded!');
            this.emit('maxDepthExceeded', {
                depth: this.loadingStack.length,
                stack: this.loadingStack
            });
        }
    }
    
    /**
     * 🔍 Check for circular dependency
     */
    checkCircularDependency(modulePath) {
        // Look for module in current loading stack
        const existingIndex = this.loadingStack.findIndex(entry => entry.to === modulePath);
        
        if (existingIndex !== -1) {
            // Found circular dependency!
            const cycle = this.loadingStack.slice(existingIndex).map(e => e.to);
            cycle.push(modulePath);
            
            const cycleKey = cycle.join(' -> ');
            
            if (!this.circularDependencies.has(cycleKey)) {
                this.circularDependencies.add(cycleKey);
                
                // Log based on level
                if (this.config.logLevel === 'error') {
                    console.error(`🔄 Circular dependency detected: ${cycleKey}`);
                } else if (this.config.logLevel === 'warn') {
                    console.warn(`⚠️ Circular dependency detected: ${cycleKey}`);
                }
                
                this.emit('circularDependencyDetected', {
                    cycle,
                    cycleKey,
                    depth: this.loadingStack.length
                });
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * 🔧 Break circular dependency
     */
    breakCircularDependency(modulePath, originalRequire, moduleContext) {
        console.warn(`🔧 Breaking circular dependency for: ${modulePath}`);
        
        // Create a proxy module
        const proxy = this.createModuleProxy(modulePath);
        
        // Record broken dependency
        this.brokenDependencies.set(modulePath, {
            brokenAt: Date.now(),
            fromModule: moduleContext.filename,
            proxy
        });
        
        // Schedule deferred loading
        setImmediate(() => {
            try {
                const actualModule = originalRequire.call(moduleContext, modulePath);
                this.resolveProxy(proxy, actualModule);
            } catch (error) {
                console.error(`❌ Failed to load deferred module ${modulePath}:`, error);
            }
        });
        
        return proxy;
    }
    
    /**
     * 🎯 Create module proxy for circular dependencies
     */
    createModuleProxy(modulePath) {
        const self = this;
        const pending = { resolved: false, module: null };
        
        const handler = {
            get(target, property) {
                if (pending.resolved && pending.module) {
                    return pending.module[property];
                }
                
                // Log access attempt
                if (self.config.logLevel === 'debug') {
                    console.log(`🔍 Proxy access: ${modulePath}.${String(property)}`);
                }
                
                // Return a function that will retry later
                if (typeof property === 'string') {
                    return function circularDependencyProxy(...args) {
                        if (pending.resolved && pending.module) {
                            const fn = pending.module[property];
                            if (typeof fn === 'function') {
                                return fn.apply(pending.module, args);
                            }
                            return fn;
                        }
                        
                        console.warn(`⚠️ Accessing unresolved circular dependency: ${modulePath}.${property}`);
                        return undefined;
                    };
                }
                
                return undefined;
            },
            
            set(target, property, value) {
                if (pending.resolved && pending.module) {
                    pending.module[property] = value;
                    return true;
                }
                
                console.warn(`⚠️ Cannot set property on unresolved module: ${modulePath}.${String(property)}`);
                return false;
            }
        };
        
        const proxy = new Proxy({}, handler);
        proxy.__circularDependencyProxy = true;
        proxy.__modulePath = modulePath;
        proxy.__pending = pending;
        
        return proxy;
    }
    
    /**
     * ✅ Resolve proxy with actual module
     */
    resolveProxy(proxy, actualModule) {
        if (proxy.__circularDependencyProxy && proxy.__pending) {
            proxy.__pending.resolved = true;
            proxy.__pending.module = actualModule;
            
            console.log(`✅ Resolved circular dependency proxy: ${proxy.__modulePath}`);
            
            this.emit('proxyResolved', {
                modulePath: proxy.__modulePath,
                module: actualModule
            });
        }
    }
    
    /**
     * 🎨 Visualize dependency graph
     */
    visualizeDependencyGraph(options = {}) {
        const {
            showStats = true,
            showCircular = true,
            maxDepth = 3
        } = options;
        
        console.log('\n🎨 MODULE DEPENDENCY GRAPH');
        console.log('==========================\n');
        
        // Show circular dependencies first
        if (showCircular && this.circularDependencies.size > 0) {
            console.log('🔄 CIRCULAR DEPENDENCIES:');
            for (const cycle of this.circularDependencies) {
                console.log(`   ${cycle}`);
            }
            console.log('');
        }
        
        // Show dependency tree
        console.log('📊 DEPENDENCY TREE:');
        const visited = new Set();
        const rootModules = this.findRootModules();
        
        for (const root of rootModules) {
            this.printDependencyTree(root, 0, maxDepth, visited);
        }
        
        // Show statistics
        if (showStats) {
            console.log('\n📈 STATISTICS:');
            console.log(`Total modules: ${this.dependencyGraph.size}`);
            console.log(`Circular dependencies: ${this.circularDependencies.size}`);
            console.log(`Broken dependencies: ${this.brokenDependencies.size}`);
            
            // Most imported modules
            const sortedImports = Array.from(this.importStats.entries())
                .sort((a, b) => b[1].importCount - a[1].importCount)
                .slice(0, 5);
            
            if (sortedImports.length > 0) {
                console.log('\n🔥 Most imported modules:');
                for (const [module, stats] of sortedImports) {
                    console.log(`   ${this.getModuleName(module)}: ${stats.importCount} times`);
                }
            }
        }
    }
    
    /**
     * 🌳 Print dependency tree
     */
    printDependencyTree(module, depth, maxDepth, visited) {
        if (depth > maxDepth || visited.has(module)) {
            return;
        }
        
        visited.add(module);
        
        const indent = '  '.repeat(depth);
        const name = this.getModuleName(module);
        const isCircular = this.isInCircularDependency(module);
        const marker = isCircular ? '🔄' : '📦';
        
        console.log(`${indent}${marker} ${name}`);
        
        const dependencies = this.dependencyGraph.get(module);
        if (dependencies) {
            for (const dep of dependencies) {
                this.printDependencyTree(dep, depth + 1, maxDepth, visited);
            }
        }
    }
    
    /**
     * 🌱 Find root modules (no dependencies)
     */
    findRootModules() {
        const allModules = new Set(this.dependencyGraph.keys());
        const dependedUpon = new Set();
        
        for (const deps of this.dependencyGraph.values()) {
            for (const dep of deps) {
                dependedUpon.add(dep);
            }
        }
        
        return Array.from(allModules).filter(m => !dependedUpon.has(m));
    }
    
    /**
     * 📛 Get module name from path
     */
    getModuleName(modulePath) {
        if (!modulePath) return 'unknown';
        
        // Extract meaningful name from path
        const parts = modulePath.split(/[/\\]/);
        const filename = parts[parts.length - 1];
        
        // Remove extension
        return filename.replace(/\.(js|mjs|ts|tsx)$/, '');
    }
    
    /**
     * 🔍 Check if module is in circular dependency
     */
    isInCircularDependency(module) {
        for (const cycle of this.circularDependencies) {
            if (cycle.includes(module)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 📊 Get circular dependency report
     */
    getReport() {
        return {
            totalModules: this.dependencyGraph.size,
            circularDependencies: Array.from(this.circularDependencies),
            brokenDependencies: Array.from(this.brokenDependencies.entries()).map(([path, info]) => ({
                path,
                brokenAt: info.brokenAt,
                fromModule: info.fromModule
            })),
            statistics: {
                totalImports: Array.from(this.importStats.values()).reduce((sum, stats) => sum + stats.importCount, 0),
                averageImportsPerModule: this.importStats.size > 0 ? 
                    Array.from(this.importStats.values()).reduce((sum, stats) => sum + stats.importCount, 0) / this.importStats.size : 0
            }
        };
    }
    
    /**
     * 🧹 Clear all data
     */
    clear() {
        this.loadingStack = [];
        this.circularDependencies.clear();
        this.dependencyGraph.clear();
        this.importStats.clear();
        this.brokenDependencies.clear();
        
        console.log('🧹 CircularDependencyDetector cleared');
    }
    
    /**
     * 🛑 Uninstall hooks
     */
    uninstallHooks() {
        // Note: This is simplified - in production you'd store the original
        // require and restore it properly
        console.warn('⚠️ Hook uninstallation not fully implemented');
    }
}

// Create singleton instance
export const circularDetector = new CircularDependencyDetector({
    autoInstall: false, // Don't auto-install by default
    breakCircularDeps: true,
    logLevel: 'warn'
});

// Export convenience functions
export function detectCircularDependencies() {
    return circularDetector.getReport();
}

export function visualizeCircularDependencies(options) {
    circularDetector.visualizeDependencyGraph(options);
}

export function installCircularDetection() {
    circularDetector.installHooks();
}
