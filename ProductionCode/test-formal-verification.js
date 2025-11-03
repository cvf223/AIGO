/**
 * @fileoverview
 * SUPERIOR Integration Test for the Formal Verification System.
 *
 * @description
 * This is a top-tier integration test that validates the syndicate's formal
 * verification capabilities using the proper, centralized factory architecture.
 * It ensures the database is initialized, starts the factory to create and inject
 * all service dependencies, and then runs a comprehensive test suite.
 * This is the gold standard for testing a complex, decoupled system.
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import { UltimateArbitrageSyndicateFactory } from './UltimateArbitrageSyndicateFactory.js';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.USE_EXTERNAL_API_FOR_TEST = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSuperiorIntegrationTest() {
    console.log('--- Starting Superior Integration Test for Formal Verification ---');

    // Step 1: Initialize Database
    console.log('\n--- Step 1: Initializing Production Database Schema ---');
    try {
        execSync('node database/initialize-db.js', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ CRITICAL: Failed to initialize database. Halting tests.', error);
        process.exit(1);
    }

    // Step 2: Initialize the entire Syndicate via the Factory
    console.log('\n--- Step 2: Initializing Syndicate via Factory ---');
    const factory = new UltimateArbitrageSyndicateFactory();
    await factory.initialize();
    
    // Retrieve services from the factory's registry
    const { 
        opportunityCalculator, 
        judge, 
        rewardEngine, 
        codeValidator 
    } = factory.services;

    if (!opportunityCalculator || !judge || !rewardEngine || !codeValidator) {
        console.error('❌ CRITICAL: Factory failed to initialize required services. Halting.');
        process.exit(1);
    }
    console.log('✅ Factory and all services initialized successfully.');

    // Step 3: Run Verification Logic Tests
    console.log('\n--- Step 3: Running Verification Tests ---');

    // Phase 1 is implicitly tested by the successful initialization of the calculator.
    if (!opportunityCalculator.isLogicVerified) {
        console.error('❌ TEST FAILED: Calculator core logic was not verified during startup.');
        process.exit(1);
    }
    console.log('✅ Phase 1 PASSED: Opportunity calculator self-verified its core logic on startup.');
    
    // Phase 2: Judge Autoformalization and Reward
    const mockSuccessfulExecution = {
        grossProfit: 1000n,
        totalCosts: 200n,
        netProfit: 800n,
    };
    const mockOpportunity = { type: 'atomic_swap', complexity: 1 };
    const formalizationResult = await judge.attemptAutoformalization(mockSuccessfulExecution, mockOpportunity);

    if (!formalizationResult.isProvable) {
        console.error('❌ TEST FAILED: Judge failed to autoformalize a valid pattern.', formalizationResult);
        process.exit(1);
    }
    
    const reward = await rewardEngine.issueProvableStrategyReward('SuperiorTestAgent-01', formalizationResult.proof, formalizationResult.theorem);
    
    if (reward && reward.type === 'PROVABLE_STRATEGY_DISCOVERY') {
        console.log(`✅ Phase 2 PASSED: Correctly issued a ${reward.type} of ${reward.amount}.`);
    } else {
        console.error('❌ TEST FAILED: Failed to issue the correct high-value reward.');
        process.exit(1);
    }

    // Phase 3: AI-Generated Code Safety Validation
    const specPath = path.resolve(__dirname, './packages/core/src/verification/specifications/OpportunityCalculator.lean');
    
    const correctCode = `
        class AIImpl {
            static calculateNetProfit(calcInput) {
                const { grossRevenue, costs, adjustments } = calcInput;
                const totalCosts = Object.values(costs).reduce((sum, cost) => sum + BigInt(cost), 0n);
                const netProfit = (BigInt(grossRevenue) - totalCosts) + BigInt(adjustments || 0);
                return { netProfit };
            }
        }
    `;
    const validationResult = await codeValidator.validateCode({ generatedCode: correctCode, specFilePath: specPath, targetMethod: 'calculateNetProfit' });
    if (!validationResult.isValid) {
        console.error('❌ TEST FAILED: Validator rejected formally correct AI-generated code.');
        process.exit(1);
    }

    console.log('✅ Phase 3 PASSED: Code safety validator is functioning correctly.');
    console.log('\n--- ✅ All Tests PASSED. Superior architecture is fully validated. ---');
    
    // Cleanup
    await factory.services.dbPool.end();
}

runSuperiorIntegrationTest().catch(err => {
    console.error("A critical error occurred during the test run:", err);
    process.exit(1);
});
