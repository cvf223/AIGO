/**
 * 🚀 INITIALIZATION MANAGER - PHASED STARTUP ORCHESTRATION
 * ========================================================
 * 
 * Manages the complex initialization sequence with dependency tracking,
 * error boundaries, and rollback capabilities
 * 
 * FEATURES:
 * - 6-phase initialization pipeline
 * - Dependency tracking and validation
 * - Error boundaries for each phase
 * - Rollback on failure
 * - Health checks and timeouts
 * - Progress monitoring
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export class InitializationManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxPhaseTimeout: config.maxPhaseTimeout || 60000, // 60 seconds per phase
            maxTotalTimeout: config.maxTotalTimeout || 300000, // 5 minutes total
            enableRollback: config.enableRollback !== false,
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 5000,
            ...config
        };
        
        // Define initialization phases
        this.phases = [
            {
                id: 'core-infrastructure',
                name: 'Core Infrastructure',
                critical: true,
                components: ['patches', 'database', 'logging'],
                timeout: 30000
            },
            {
                id: 'base-services',
                name: 'Base Services',
                critical: true,
                components: ['memory', 'worldModel', 'contextEngine'],
                timeout: 45000
            },
            {
                id: 'learning-systems',
                name: 'Learning Systems',
                critical: false,
                parallel: true,
                components: ['alphaGnome', 'quantumEvolution', 'transformers'],
                timeout: 60000
            },
            {
                id: 'syndicate-factory',
                name: 'Syndicate Factory & Agents',
                critical: true,
                components: ['syndicateFactory', 'agents', 'services'],
                timeout: 60000
            },
            {
                id: 'ui-monitoring',
                name: 'UI & Monitoring',
                critical: false,
                components: ['webInterface', 'monitoring', 'metrics'],
                timeout: 30000
            },
            {
                id: 'background-tasks',
                name: 'Background Tasks',
                critical: false,
                components: ['autonomousIntelligence', 'backgroundTasks'],
                timeout: 30000
            }
        ];
        
        // Initialization state tracking
        this.phaseStates = new Map();
        this.componentStates = new Map();
        this.initializationOrder = [];
        this.rollbackStack = [];
        
        // Timing and metrics
        this.startTime = null;
        this.phaseTimes = new Map();
        this.componentTimes = new Map();
        
        // Error tracking
        this.errors = [];
        this.warnings = [];
        
        // Component registry
        this.componentRegistry = new Map();
        
        // Initialize phase states
        this.phases.forEach(phase => {
            this.phaseStates.set(phase.id, 'pending');
        });
        
        console.log('🚀 InitializationManager created with', this.phases.length, 'phases');
    }
    
    /**
     * 📝 Register component initializer
     */
    registerComponent(name, initializer, options = {}) {
        this.componentRegistry.set(name, {
            name,
            initializer,
            dependencies: options.dependencies || [],
            rollback: options.rollback || null,
            critical: options.critical !== false,
            timeout: options.timeout || 30000,
            retryable: options.retryable !== false,
            preferredPhase: options.preferredPhase || null
        });
        
        this.componentStates.set(name, 'pending');
        console.log(`📝 Registered component: ${name}`);
    }
    
    /**
     * 🎯 Start initialization sequence
     */
    async initialize() {
        console.log('\n🚀 STARTING PHASED INITIALIZATION');
        console.log('==================================');
        
        this.startTime = performance.now();
        this.emit('initializationStarted', { phases: this.phases.length });
        
        try {
            // Set up global timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Initialization timeout exceeded (${this.config.maxTotalTimeout}ms)`));
                }, this.config.maxTotalTimeout);
            });
            
            // Run initialization with timeout
            await Promise.race([
                this.runPhases(),
                timeoutPromise
            ]);
            
            const totalTime = performance.now() - this.startTime;
            console.log(`\n✅ INITIALIZATION COMPLETE in ${(totalTime / 1000).toFixed(2)}s`);
            
            this.emit('initializationComplete', {
                totalTime,
                phases: Object.fromEntries(this.phaseStates),
                components: Object.fromEntries(this.componentStates)
            });
            
            return true;
            
        } catch (error) {
            console.error('\n❌ INITIALIZATION FAILED:', error.message);
            
            if (this.config.enableRollback) {
                await this.performRollback();
            }
            
            this.emit('initializationFailed', {
                error,
                completedPhases: this.getCompletedPhases(),
                failedPhase: this.getCurrentPhase()
            });
            
            throw error;
        }
    }
    
    /**
     * 🔄 Run all phases in sequence
     */
    async runPhases() {
        for (const phase of this.phases) {
            await this.runPhase(phase);
        }
    }
    
    /**
     * 🎯 Run single phase
     */
    async runPhase(phase) {
        console.log(`\n📋 PHASE: ${phase.name}`);
        console.log('─'.repeat(40));
        
        const phaseStartTime = performance.now();
        this.phaseStates.set(phase.id, 'running');
        
        this.emit('phaseStarted', { phase: phase.id, name: phase.name });
        
        try {
            // Create phase timeout
            const phaseTimeout = phase.timeout || this.config.maxPhaseTimeout;
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Phase '${phase.name}' timeout (${phaseTimeout}ms)`));
                }, phaseTimeout);
            });
            
            // Run phase components
            await Promise.race([
                this.runPhaseComponents(phase),
                timeoutPromise
            ]);
            
            const phaseTime = performance.now() - phaseStartTime;
            this.phaseTimes.set(phase.id, phaseTime);
            this.phaseStates.set(phase.id, 'completed');
            
            console.log(`✅ Phase '${phase.name}' completed in ${(phaseTime / 1000).toFixed(2)}s`);
            
            this.emit('phaseCompleted', {
                phase: phase.id,
                name: phase.name,
                time: phaseTime
            });
            
        } catch (error) {
            this.phaseStates.set(phase.id, 'failed');
            
            if (phase.critical) {
                console.error(`❌ Critical phase '${phase.name}' failed:`, error.message);
                throw error;
            } else {
                console.warn(`⚠️ Non-critical phase '${phase.name}' failed:`, error.message);
                this.warnings.push({
                    phase: phase.id,
                    error: error.message,
                    time: Date.now()
                });
            }
        }
    }
    
    /**
     * 🔧 Run components for a phase
     */
    async runPhaseComponents(phase) {
        // Get components explicitly listed for this phase
        const explicitComponents = phase.components.map(name => 
            this.componentRegistry.get(name)
        ).filter(Boolean);
        
        // Also look for components that might belong to this phase based on naming or tags
        const allComponents = Array.from(this.componentRegistry.values());
        const additionalComponents = allComponents.filter(comp => {
            // Skip components already in explicit list
            if (explicitComponents.includes(comp)) return false;
            
            // Check if component has phase preference
            if (comp.preferredPhase === phase.id) return true;
            
            // Check component state - only include pending ones
            const state = this.componentStates.get(comp.name);
            return state === 'pending';
        });
        
        // Combine all components for this phase
        const components = [...explicitComponents, ...additionalComponents];
        
        if (components.length === 0) {
            console.warn(`⚠️ No components registered for phase '${phase.name}'`);
            return;
        }
        
        console.log(`   🔧 Found ${components.length} components for phase '${phase.name}'`);
        
        if (phase.parallel) {
            // Run components in parallel
            await Promise.all(
                components.map(comp => this.initializeComponent(comp))
            );
        } else {
            // Run components sequentially
            for (const component of components) {
                await this.initializeComponent(component);
            }
        }
    }
    
    /**
     * 🏗️ Initialize single component
     */
    async initializeComponent(component, retryCount = 0) {
        const startTime = performance.now();
        console.log(`   🔧 Initializing ${component.name}...`);
        
        this.componentStates.set(component.name, 'initializing');
        
        try {
            // Check dependencies first
            await this.checkDependencies(component);
            
            // Create component timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Component '${component.name}' timeout`));
                }, component.timeout);
            });
            
            // Initialize component
            const result = await Promise.race([
                component.initializer(),
                timeoutPromise
            ]);
            
            const initTime = performance.now() - startTime;
            this.componentTimes.set(component.name, initTime);
            this.componentStates.set(component.name, 'ready');
            this.initializationOrder.push(component.name);
            
            // Add to rollback stack if rollback function provided
            if (component.rollback) {
                this.rollbackStack.push({
                    name: component.name,
                    rollback: component.rollback,
                    result
                });
            }
            
            console.log(`   ✅ ${component.name} ready (${initTime.toFixed(0)}ms)`);
            
            this.emit('componentInitialized', {
                name: component.name,
                time: initTime,
                result
            });
            
            return result;
            
        } catch (error) {
            this.componentStates.set(component.name, 'failed');
            console.error(`   ❌ ${component.name} failed:`, error.message);
            
            // Retry logic
            if (component.retryable && retryCount < this.config.retryAttempts) {
                console.log(`   🔄 Retrying ${component.name} (attempt ${retryCount + 1})...`);
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                return await this.initializeComponent(component, retryCount + 1);
            }
            
            // Record error
            this.errors.push({
                component: component.name,
                error: error.message,
                stack: error.stack,
                time: Date.now()
            });
            
            if (component.critical) {
                throw error;
            }
        }
    }
    
    /**
     * 🔍 Check component dependencies
     */
    async checkDependencies(component) {
        for (const dep of component.dependencies) {
            const depState = this.componentStates.get(dep);
            
            if (depState !== 'ready') {
                throw new Error(`Dependency '${dep}' not ready for '${component.name}'`);
            }
        }
    }
    
    /**
     * 🔙 Perform rollback on failure
     */
    async performRollback() {
        console.log('\n🔙 PERFORMING ROLLBACK');
        console.log('=====================');
        
        // Rollback in reverse order
        while (this.rollbackStack.length > 0) {
            const { name, rollback, result } = this.rollbackStack.pop();
            
            try {
                console.log(`   🔙 Rolling back ${name}...`);
                await rollback(result);
                console.log(`   ✅ ${name} rolled back`);
            } catch (error) {
                console.error(`   ❌ Failed to rollback ${name}:`, error.message);
            }
        }
        
        console.log('✅ Rollback complete');
    }
    
    /**
     * 📊 Get initialization progress
     */
    getProgress() {
        const totalPhases = this.phases.length;
        const completedPhases = this.getCompletedPhases().length;
        
        const totalComponents = this.componentRegistry.size;
        const completedComponents = Array.from(this.componentStates.values())
            .filter(state => state === 'ready').length;
        
        return {
            phases: {
                total: totalPhases,
                completed: completedPhases,
                percentage: (completedPhases / totalPhases) * 100
            },
            components: {
                total: totalComponents,
                completed: completedComponents,
                percentage: (completedComponents / totalComponents) * 100
            },
            elapsedTime: this.startTime ? performance.now() - this.startTime : 0,
            currentPhase: this.getCurrentPhase()
        };
    }
    
    /**
     * 📋 Get completed phases
     */
    getCompletedPhases() {
        return Array.from(this.phaseStates.entries())
            .filter(([_, state]) => state === 'completed')
            .map(([phase, _]) => phase);
    }
    
    /**
     * 🎯 Get current phase
     */
    getCurrentPhase() {
        for (const [phase, state] of this.phaseStates) {
            if (state === 'running') {
                return phase;
            }
        }
        return null;
    }
    
    /**
     * 🏥 Health check all components
     */
    async healthCheck() {
        const results = new Map();
        
        for (const [name, component] of this.componentRegistry) {
            const state = this.componentStates.get(name);
            
            results.set(name, {
                state,
                healthy: state === 'ready',
                initTime: this.componentTimes.get(name) || null
            });
        }
        
        return {
            healthy: Array.from(results.values()).every(r => r.healthy),
            components: Object.fromEntries(results),
            errors: this.errors,
            warnings: this.warnings
        };
    }
    
    /**
     * 📈 Get initialization metrics
     */
    getMetrics() {
        return {
            totalTime: this.startTime ? performance.now() - this.startTime : 0,
            phases: Object.fromEntries(this.phaseTimes),
            components: Object.fromEntries(this.componentTimes),
            initializationOrder: this.initializationOrder,
            errors: this.errors.length,
            warnings: this.warnings.length
        };
    }
    
    /**
     * 🎨 Visualize initialization status
     */
    visualizeStatus() {
        console.log('\n🎨 INITIALIZATION STATUS');
        console.log('========================\n');
        
        // Phase status
        console.log('📋 PHASES:');
        for (const phase of this.phases) {
            const state = this.phaseStates.get(phase.id);
            const emoji = {
                pending: '⏳',
                running: '🔄',
                completed: '✅',
                failed: '❌'
            }[state] || '❓';
            
            const time = this.phaseTimes.get(phase.id);
            const timeStr = time ? ` (${(time / 1000).toFixed(2)}s)` : '';
            
            console.log(`${emoji} ${phase.name}${timeStr}`);
        }
        
        // Component status
        console.log('\n🔧 COMPONENTS:');
        const components = Array.from(this.componentStates.entries());
        const ready = components.filter(([_, state]) => state === 'ready').length;
        const failed = components.filter(([_, state]) => state === 'failed').length;
        
        console.log(`Total: ${components.length}`);
        console.log(`Ready: ${ready}`);
        console.log(`Failed: ${failed}`);
        
        // Progress
        const progress = this.getProgress();
        console.log('\n📊 PROGRESS:');
        console.log(`Phases: ${progress.phases.completed}/${progress.phases.total} (${progress.phases.percentage.toFixed(0)}%)`);
        console.log(`Components: ${progress.components.completed}/${progress.components.total} (${progress.components.percentage.toFixed(0)}%)`);
        
        if (progress.elapsedTime > 0) {
            console.log(`Time: ${(progress.elapsedTime / 1000).toFixed(2)}s`);
        }
        
        // Errors and warnings
        if (this.errors.length > 0) {
            console.log(`\n❌ Errors: ${this.errors.length}`);
            for (const error of this.errors.slice(0, 3)) {
                console.log(`  - ${error.component}: ${error.error}`);
            }
        }
        
        if (this.warnings.length > 0) {
            console.log(`\n⚠️ Warnings: ${this.warnings.length}`);
        }
    }
    
    /**
     * 🛑 Reset initialization state
     */
    reset() {
        this.phaseStates.clear();
        this.componentStates.clear();
        this.initializationOrder = [];
        this.rollbackStack = [];
        this.phaseTimes.clear();
        this.componentTimes.clear();
        this.errors = [];
        this.warnings = [];
        this.startTime = null;
        
        // Reset phase states
        this.phases.forEach(phase => {
            this.phaseStates.set(phase.id, 'pending');
        });
        
        // Reset component states
        this.componentRegistry.forEach((_, name) => {
            this.componentStates.set(name, 'pending');
        });
        
        console.log('🔄 InitializationManager reset');
    }
}

// Create singleton instance
export const initializationManager = new InitializationManager();

// Export convenience functions
export function registerInitializer(name, initializer, options) {
    return initializationManager.registerComponent(name, initializer, options);
}

export async function runInitialization() {
    return await initializationManager.initialize();
}

export function getInitializationProgress() {
    return initializationManager.getProgress();
}
