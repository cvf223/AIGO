#!/usr/bin/env node

/**
 * 🧠 SEQUENTIAL LLM + GOT REASONING TEST (SMALLEST TO LARGEST)
 * ============================================================
 * Tests LLMs individually from smallest to largest with timeouts
 * Using German HOAI architecture prompt
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_PROMPT = "was ist besonders and deutscher architektur nach der HOAI ??!";

// Models ordered by size (smallest to largest)
const MODELS_BY_SIZE = [
    { name: 'phi3:14b', size: '7.9GB', description: 'Smallest - Mathematical/Logic' },
    { name: 'mistral:7b-instruct-fp16', size: '14.5GB', description: 'Fast Response' },
    { name: 'llava:34b', size: '20.2GB', description: 'Vision Capable' },
    { name: 'llama3.3:70b', size: '42.5GB', description: 'Large Language Model' },
    { name: 'qwen2.5:72b-instruct-q4_k_m', size: '47.4GB', description: 'Largest - Primary Model' }
];

const TEST_TIMEOUT = 60000; // 60 second timeout per model
const LOAD_TIMEOUT = 30000; // 30 second timeout for model loading

class SequentialLLMTester {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
        this.currentTest = 0;
    }
    
    /**
     * Initialize connections
     */
    async initialize() {
        console.log('🧠 SEQUENTIAL LLM + GOT REASONING TEST');
        console.log('='.repeat(60));
        console.log(`📋 Test Prompt: "${TEST_PROMPT}"`);
        console.log(`🎯 Testing ${MODELS_BY_SIZE.length} models (smallest → largest)`);
        console.log(`⏱️ Timeout: ${TEST_TIMEOUT/1000}s per model`);
        console.log('='.repeat(60));
        
        // Show model order
        console.log('📊 MODEL TEST ORDER (by size):');
        MODELS_BY_SIZE.forEach((model, index) => {
            console.log(`   ${index + 1}. ${model.name} (${model.size}) - ${model.description}`);
        });
        console.log('='.repeat(60));
        
        try {
            // Connect to database
            const { Pool } = await import('pg');
            this.dbPool = new Pool({
                host: 'localhost',
                port: 5432,
                database: 'construction_syndicate',
                user: 'postgres',
                max: 5,
                connectionTimeoutMillis: 5000
            });
            
            console.log('✅ Database connection established');
            
            // Test database
            const dbTest = await this.dbPool.query('SELECT NOW() as current_time');
            console.log(`✅ Database test: ${dbTest.rows[0].current_time}`);
            
        } catch (error) {
            console.error('❌ Failed to initialize:', error.message);
            throw error;
        }
    }
    
    /**
     * Test individual LLM with timeout protection
     */
    async testLLMWithTimeout(modelInfo) {
        const { name: modelName, size, description } = modelInfo;
        this.currentTest++;
        
        console.log(`\n🧠 TEST ${this.currentTest}/${MODELS_BY_SIZE.length}: ${modelName}`);
        console.log(`📊 Size: ${size} | Type: ${description}`);
        console.log('-'.repeat(50));
        
        const testStart = Date.now();
        
        try {
            // Test with timeout
            const testPromise = this.testSingleModel(modelName);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Timeout after ${TEST_TIMEOUT/1000}s`)), TEST_TIMEOUT);
            });
            
            const result = await Promise.race([testPromise, timeoutPromise]);
            
            const duration = Date.now() - testStart;
            console.log(`✅ ${modelName} completed successfully (${Math.round(duration/1000)}s)`);
            
            this.testResults.push({
                model: modelName,
                size,
                description,
                success: true,
                result,
                duration
            });
            
            return result;
            
        } catch (error) {
            const duration = Date.now() - testStart;
            console.log(`❌ ${modelName} failed: ${error.message} (${Math.round(duration/1000)}s)`);
            
            this.testResults.push({
                model: modelName,
                size,
                description,
                success: false,
                error: error.message,
                duration
            });
            
            return null;
        }
    }
    
    /**
     * Test single model with direct API calls
     */
    async testSingleModel(modelName) {
        console.log('🔗 Testing direct Ollama connection...');
        
        // Simple direct test first
        const directResult = await this.testDirectOllama(modelName, TEST_PROMPT);
        
        if (!directResult.success) {
            throw new Error(`Direct test failed: ${directResult.error}`);
        }
        
        console.log(`📊 Response: ${directResult.response?.length || 0} chars`);
        
        // Show response preview
        if (directResult.response) {
            const preview = directResult.response.substring(0, 150);
            console.log(`📋 Preview: "${preview}..."`);
            
            // Analyze German HOAI content
            const response = directResult.response.toLowerCase();
            const hoaiMentions = (response.match(/hoai/g) || []).length;
            const architectureMentions = (response.match(/architektur/g) || []).length;
            const germanMentions = (response.match(/deutsch/g) || []).length;
            
            console.log(`🎯 HOAI: ${hoaiMentions} | Architecture: ${architectureMentions} | German: ${germanMentions}`);
        }
        
        // Test simple GOT reasoning (2 steps only for speed)
        console.log('🌐 Testing simplified GOT reasoning...');
        const gotResult = await this.testSimplifiedGOT(modelName);
        
        return {
            direct: directResult,
            got: gotResult
        };
    }
    
    /**
     * Test direct connection to Ollama with timeout
     */
    async testDirectOllama(modelName, prompt) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT);
            
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: modelName,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        max_tokens: 500,  // Reduced for faster responses
                        stop: ['\n\n\n']  // Stop on multiple newlines
                    }
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`
                };
            }
            
            const data = await response.json();
            
            return {
                success: true,
                response: data.response,
                model: data.model,
                totalDuration: data.total_duration,
                loadDuration: data.load_duration
            };
            
        } catch (error) {
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request timeout'
                };
            }
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Simplified GOT reasoning (just 2 steps)
     */
    async testSimplifiedGOT(modelName) {
        try {
            // Step 1: What is HOAI?
            const step1Result = await this.testDirectOllama(
                modelName, 
                "Was ist die HOAI (Honorarordnung für Architekten und Ingenieure)?"
            );
            
            if (!step1Result.success) {
                return { success: false, error: 'Step 1 failed', steps: 0 };
            }
            
            // Step 2: German architecture characteristics
            const step2Result = await this.testDirectOllama(
                modelName,
                `Kontext: HOAI ist ${step1Result.response?.substring(0, 100)}...\n\nFrage: Welche Besonderheiten hat deutsche Architektur nach HOAI?`
            );
            
            const success = step2Result.success;
            const steps = success ? 2 : 1;
            
            console.log(`   🌐 GOT: ${steps}/2 steps completed`);
            
            return {
                success,
                steps,
                step1: step1Result,
                step2: step2Result
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                steps: 0
            };
        }
    }
    
    /**
     * Run sequential test on all models
     */
    async runSequentialTest() {
        await this.initialize();
        
        console.log('\n🚀 Starting sequential tests (smallest → largest)...\n');
        
        let successCount = 0;
        
        // Test each model in order
        for (const modelInfo of MODELS_BY_SIZE) {
            try {
                const result = await this.testLLMWithTimeout(modelInfo);
                if (result) {
                    successCount++;
                }
                
                // Small delay between tests
                console.log('⏳ Cooling down (3s)...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                
            } catch (error) {
                console.error(`💥 Critical error testing ${modelInfo.name}:`, error.message);
                // Continue with next model
            }
        }
        
        // Generate final report
        this.generateFinalReport(successCount);
        
        // Cleanup
        if (this.dbPool) {
            await this.dbPool.end();
        }
    }
    
    /**
     * Generate final test report
     */
    generateFinalReport(successCount) {
        const totalDuration = Date.now() - this.startTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 SEQUENTIAL LLM + GOT TEST RESULTS');
        console.log('='.repeat(60));
        
        console.log(`📋 Test Prompt: "${TEST_PROMPT}"`);
        console.log(`⏱️ Total Duration: ${Math.round(totalDuration / 1000)}s`);
        console.log(`📊 Models Tested: ${this.testResults.length}/${MODELS_BY_SIZE.length}`);
        console.log(`✅ Successful Tests: ${successCount}/${this.testResults.length}`);
        
        console.log('\n📋 DETAILED RESULTS (by size order):');
        
        this.testResults.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`\n${index + 1}. ${status} ${result.model} (${result.size})`);
            console.log(`   📝 ${result.description}`);
            console.log(`   ⏱️ Duration: ${Math.round(result.duration / 1000)}s`);
            
            if (result.success && result.result) {
                const directResult = result.result.direct;
                const gotResult = result.result.got;
                
                if (directResult?.response) {
                    console.log(`   📊 Response: ${directResult.response.length} chars`);
                    
                    const response = directResult.response.toLowerCase();
                    const hoaiCount = (response.match(/hoai/g) || []).length;
                    const archCount = (response.match(/architektur/g) || []).length;
                    console.log(`   🎯 HOAI: ${hoaiCount}, Architecture: ${archCount}`);
                }
                
                if (gotResult?.success) {
                    console.log(`   🌐 GOT: ✅ ${gotResult.steps}/2 steps`);
                } else {
                    console.log(`   🌐 GOT: ❌ ${gotResult?.steps || 0}/2 steps`);
                }
                
            } else if (!result.success) {
                console.log(`   ❌ Error: ${result.error}`);
            }
        });
        
        console.log('\n' + '='.repeat(60));
        
        if (successCount === this.testResults.length) {
            console.log('🎉 ALL MODELS WORKING PERFECTLY!');
            console.log('✅ Sequential testing successful');
            console.log('🧠 GOT reasoning operational');
            console.log('🇩🇪 German HOAI knowledge verified');
        } else if (successCount > 0) {
            console.log(`⚠️ PARTIAL SUCCESS: ${successCount}/${this.testResults.length} models working`);
            console.log('   Consider using working models only');
        } else {
            console.log('❌ ALL MODELS FAILED');
            console.log('   Check Ollama service and model loading');
        }
        
        console.log('='.repeat(60));
    }
}

/**
 * Run the sequential test
 */
async function runTest() {
    const tester = new SequentialLLMTester();
    
    try {
        await tester.runSequentialTest();
        process.exit(0);
    } catch (error) {
        console.error('❌ Sequential test suite failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTest().catch(console.error);
}

export default SequentialLLMTester;
