#!/usr/bin/env node

/**
 * 🧬 QUANTUM EVOLUTION SYSTEM - TEST RUNNER
 * =========================================
 * 
 * Simple script to run all quantum evolution system tests
 */

import { QuantumEvolutionSystemTester } from './test-quantum-evolution-system.js';

async function main() {
    console.log('🧬 QUANTUM EVOLUTION SYSTEM - STARTING TESTS');
    console.log('============================================\n');
    
    try {
        const tester = new QuantumEvolutionSystemTester();
        await tester.runAllTests();
        
        console.log('\n✨ Test execution completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('\n💥 CRITICAL ERROR during test execution:');
        console.error(error);
        console.error('\n🚨 Please check the quantum evolution system implementation!');
        process.exit(1);
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

// Run the tests
main(); 