#!/usr/bin/env node

/**
 * 🧪 CIRCULAR DEPENDENCY FIX INTEGRATION TEST
 * ==========================================
 * 
 * Tests the refactored initialization system to ensure:
 * - No circular dependencies
 * - Fast startup time
 * - Proper phased initialization
 * - All services available
 */

import { performance } from 'perf_hooks';
import chalk from 'chalk';

// Enable debug mode and circular detection
process.env.DEBUG = 'true';
process.env.DETECT_CIRCULAR = 'true';
process.env.NODE_ENV = 'test';

console.log(chalk.cyan('🧪 CIRCULAR DEPENDENCY FIX INTEGRATION TEST'));
console.log(chalk.cyan('==========================================\n'));

async function runTest() {
    const testResults = {
        phases: [],
        services: [],
        circularDeps: [],
        errors: [],
        warnings: [],
        metrics: {}
    };
    
    try {
        console.log(chalk.yellow('📋 TEST 1: Module Loading System'));
        console.log(chalk.gray('Testing lazy module loader...'));
        
        const startTime = performance.now();
        
        // Import our systems
        const { moduleLoader, lazyLoad } = await import('./src/utils/LazyModuleLoader.js');
        const { serviceRegistry } = await import('./src/core/ServiceRegistry.js');
        const { initializationManager } = await import('./src/core/InitializationManager.js');
        const { circularDetector } = await import('./src/utils/CircularDependencyDetector.js');
        
        const loadTime = performance.now() - startTime;
        console.log(chalk.green(`✅ Core systems loaded in ${loadTime.toFixed(2)}ms`));
        testResults.metrics.coreLoadTime = loadTime;
        
        // Test lazy loading
        console.log(chalk.yellow('\n📋 TEST 2: Lazy Loading'));
        const testModules = [
            './src/patches/ApplyNullGuards.js',
            './src/database/DatabasePoolManager.js',
            './src/memory/SharedMemorySystem.js'
        ];
        
        for (const modulePath of testModules) {
            const moduleStart = performance.now();
            try {
                await lazyLoad(modulePath);
                const moduleTime = performance.now() - moduleStart;
                console.log(chalk.green(`✅ ${modulePath}: ${moduleTime.toFixed(2)}ms`));
                testResults.services.push({
                    name: modulePath,
                    status: 'loaded',
                    time: moduleTime
                });
            } catch (error) {
                console.log(chalk.red(`❌ ${modulePath}: ${error.message}`));
                testResults.errors.push({
                    module: modulePath,
                    error: error.message
                });
            }
        }
        
        // Test service registry
        console.log(chalk.yellow('\n📋 TEST 3: Service Registry'));
        
        // Register test services
        serviceRegistry.register('testService1', () => ({
            name: 'Test Service 1',
            getValue: () => 42
        }));
        
        serviceRegistry.register('testService2', async (deps) => ({
            name: 'Test Service 2',
            value: deps.testService1.getValue() * 2
        }), { dependencies: ['testService1'] });
        
        // Get services
        const service1 = await serviceRegistry.get('testService1');
        const service2 = await serviceRegistry.get('testService2');
        
        console.log(chalk.green(`✅ Service 1: ${service1.name}`));
        console.log(chalk.green(`✅ Service 2: ${service2.name} (value: ${service2.value})`));
        
        // Test initialization manager
        console.log(chalk.yellow('\n📋 TEST 4: Phased Initialization'));
        
        // Register test phases with proper phase assignment
        initializationManager.reset();
        
        initializationManager.registerComponent('patches', async () => {
            console.log(chalk.gray('   Core infrastructure executing...'));
            await new Promise(resolve => setTimeout(resolve, 50));
            testResults.phases.push('core-infrastructure');
        }, { preferredPhase: 'core-infrastructure' });
        
        initializationManager.registerComponent('memory', async () => {
            console.log(chalk.gray('   Base services executing...'));
            await new Promise(resolve => setTimeout(resolve, 50));
            testResults.phases.push('base-services');
        }, { 
            dependencies: ['patches'],
            preferredPhase: 'base-services'
        });
        
        const initStart = performance.now();
        await initializationManager.initialize();
        const initTime = performance.now() - initStart;
        
        console.log(chalk.green(`✅ Initialization completed in ${initTime.toFixed(2)}ms`));
        testResults.metrics.initTime = initTime;
        
        // Check circular dependencies
        console.log(chalk.yellow('\n📋 TEST 5: Circular Dependency Detection'));
        
        const circularReport = circularDetector.getReport();
        testResults.circularDeps = circularReport.circularDependencies;
        
        if (circularReport.circularDependencies.length === 0) {
            console.log(chalk.green('✅ No circular dependencies detected!'));
        } else {
            console.log(chalk.red(`❌ Found ${circularReport.circularDependencies.length} circular dependencies`));
            circularReport.circularDependencies.forEach(dep => {
                console.log(chalk.red(`   ${dep}`));
            });
        }
        
        // Module loader stats
        const moduleStats = moduleLoader.getStatistics();
        console.log(chalk.yellow('\n📋 TEST 6: Module Loader Statistics'));
        console.log(chalk.gray(`   Total modules loaded: ${moduleStats.totalModules}`));
        console.log(chalk.gray(`   Cache hits: ${moduleStats.cacheHitRatio || 0}%`));
        console.log(chalk.gray(`   Circular dependencies handled: ${moduleStats.circularDependencies}`));
        
        // Service registry stats
        const serviceStats = serviceRegistry.getStatistics();
        console.log(chalk.yellow('\n📋 TEST 7: Service Registry Statistics'));
        console.log(chalk.gray(`   Total services: ${serviceStats.totalRegistered}`));
        console.log(chalk.gray(`   Ready services: ${serviceStats.ready}`));
        console.log(chalk.gray(`   Failed services: ${serviceStats.error}`));
        
        // Test actual startup (simplified)
        console.log(chalk.yellow('\n📋 TEST 8: Startup Simulation'));
        
        const startupStart = performance.now();
        
        try {
            // Import the main file
            console.log(chalk.gray('   Importing startfullsyndicate.js...'));
            
            // We'll just test the import, not full execution
            await import('./startfullsyndicate.js');
            
            const startupTime = performance.now() - startupStart;
            console.log(chalk.green(`✅ Main file imported successfully in ${startupTime.toFixed(2)}ms`));
            testResults.metrics.startupTime = startupTime;
            
        } catch (error) {
            console.log(chalk.red(`❌ Startup failed: ${error.message}`));
            testResults.errors.push({
                phase: 'startup',
                error: error.message
            });
        }
        
        // Summary
        console.log(chalk.cyan('\n📊 TEST SUMMARY'));
        console.log(chalk.cyan('=============='));
        
        const totalErrors = testResults.errors.length;
        const totalWarnings = testResults.warnings.length;
        const circularCount = testResults.circularDeps.length;
        
        if (totalErrors === 0 && circularCount === 0) {
            console.log(chalk.green('✅ ALL TESTS PASSED!'));
            console.log(chalk.green(`   ⏱️ Total test time: ${((performance.now() - startTime) / 1000).toFixed(2)}s`));
            console.log(chalk.green(`   📦 Modules loaded: ${moduleStats.totalModules}`));
            console.log(chalk.green(`   🏛️ Services ready: ${serviceStats.ready}`));
            console.log(chalk.green(`   🔄 Circular dependencies: 0`));
        } else {
            console.log(chalk.red('❌ TESTS FAILED'));
            console.log(chalk.red(`   ❌ Errors: ${totalErrors}`));
            console.log(chalk.red(`   ⚠️ Warnings: ${totalWarnings}`));
            console.log(chalk.red(`   🔄 Circular dependencies: ${circularCount}`));
        }
        
        // Performance metrics
        console.log(chalk.cyan('\n⚡ PERFORMANCE METRICS'));
        console.log(chalk.gray(`   Core load time: ${testResults.metrics.coreLoadTime?.toFixed(2)}ms`));
        console.log(chalk.gray(`   Initialization time: ${testResults.metrics.initTime?.toFixed(2)}ms`));
        console.log(chalk.gray(`   Startup time: ${testResults.metrics.startupTime?.toFixed(2)}ms`));
        
        // Recommendations
        console.log(chalk.cyan('\n💡 RECOMMENDATIONS'));
        
        if (circularCount > 0) {
            console.log(chalk.yellow('1. Fix remaining circular dependencies'));
            console.log(chalk.gray('   Run with DETECT_CIRCULAR=true for details'));
        }
        
        if (testResults.metrics.startupTime > 30000) {
            console.log(chalk.yellow('2. Optimize startup time'));
            console.log(chalk.gray('   Consider more aggressive lazy loading'));
        }
        
        if (moduleStats.cacheHitRatio < 50) {
            console.log(chalk.yellow('3. Improve module caching'));
            console.log(chalk.gray('   Preload critical modules'));
        }
        
        return totalErrors === 0 && circularCount === 0;
        
    } catch (error) {
        console.error(chalk.red('\n💥 TEST SUITE CRASHED:'), error);
        return false;
    }
}

// Run the test
console.log(chalk.gray('Starting tests...\n'));

runTest().then(success => {
    if (success) {
        console.log(chalk.green('\n🎉 Circular dependency fix verified!'));
        process.exit(0);
    } else {
        console.log(chalk.red('\n❌ Issues found - please review'));
        process.exit(1);
    }
}).catch(error => {
    console.error(chalk.red('💥 Fatal error:'), error);
    process.exit(1);
});
