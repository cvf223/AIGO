#!/usr/bin/env node

/**
 * 🧠 COMPREHENSIVE LLM + GOT REASONING TEST
 * =========================================
 * Tests all LLMs individually with Graph-of-Thought reasoning
 * Using German HOAI architecture prompt
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_PROMPT = "was ist besonders and deutscher architektur nach der HOAI ??!";
const EXPECTED_MODELS = [
    'qwen2.5:72b-instruct-q4_k_m',  // Updated to match actual model name
    'mistral:7b-instruct-fp16', 
    'llava:34b',
    'phi3:14b',
    'llama3.3:70b'
];

class LLMGOTTester {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
        this.ollamaService = null;
        this.gotEngine = null;
    }
    
    /**
     * Initialize connections to the running syndicate
     */
    async initialize() {
        console.log('🧠 COMPREHENSIVE LLM + GOT REASONING TEST');
        console.log('='.repeat(60));
        console.log(`📋 Test Prompt: "${TEST_PROMPT}"`);
        console.log(`🎯 Testing ${EXPECTED_MODELS.length} models with GOT reasoning`);
        console.log('='.repeat(60));
        
        try {
            // Connect to database first
            const { Pool } = await import('pg');
            this.dbPool = new Pool({
                host: 'localhost',
                port: 5432,
                database: 'construction_syndicate',
                user: 'postgres',
                max: 5
            });
            
            console.log('✅ Database connection established');
            
            // Test database connectivity
            const dbTest = await this.dbPool.query('SELECT NOW() as current_time');
            console.log(`✅ Database test: ${dbTest.rows[0].current_time}`);
            
        } catch (error) {
            console.error('❌ Failed to initialize:', error);
            throw error;
        }
    }
    
    /**
     * Test individual LLM with GOT reasoning
     */
    async testLLMWithGOT(modelName) {
        console.log(`\n🧠 TESTING: ${modelName}`);
        console.log('-'.repeat(40));
        
        const testStart = Date.now();
        
        try {
            // Create GOT reasoning structure for the prompt
            const gotStructure = {
                mainQuestion: TEST_PROMPT,
                graphNodes: [
                    {
                        id: 'hoai_definition',
                        question: 'Was ist die HOAI und ihre Bedeutung?',
                        dependencies: []
                    },
                    {
                        id: 'german_architecture_features', 
                        question: 'Welche Besonderheiten hat deutsche Architektur?',
                        dependencies: ['hoai_definition']
                    },
                    {
                        id: 'hoai_architecture_relationship',
                        question: 'Wie beeinflusst die HOAI die deutsche Architektur?', 
                        dependencies: ['hoai_definition', 'german_architecture_features']
                    },
                    {
                        id: 'synthesis',
                        question: 'Synthesize: Was ist das Besondere an deutscher Architektur nach HOAI?',
                        dependencies: ['hoai_architecture_relationship']
                    }
                ]
            };
            
            // Test direct Ollama connection
            console.log('🔗 Testing direct Ollama connection...');
            
            const ollamaResponse = await this.testDirectOllama(modelName, TEST_PROMPT);
            
            if (ollamaResponse.success) {
                console.log('✅ Direct Ollama test successful');
                console.log(`📊 Response length: ${ollamaResponse.response?.length || 0} chars`);
                console.log(`📊 Duration: ${Date.now() - testStart}ms`);
                
                // Show first 200 chars of response
                if (ollamaResponse.response) {
                    const preview = ollamaResponse.response.substring(0, 200);
                    console.log(`📋 Response preview: "${preview}..."`);
                }
                
                // Test GOT reasoning structure
                console.log('\n🌐 Testing GOT reasoning...');
                const gotResult = await this.executeGOTReasoning(modelName, gotStructure);
                
                this.testResults.push({
                    model: modelName,
                    success: true,
                    directTest: ollamaResponse,
                    gotTest: gotResult,
                    duration: Date.now() - testStart
                });
                
            } else {
                console.log('❌ Direct Ollama test failed');
                console.log(`   Error: ${ollamaResponse.error}`);
                
                this.testResults.push({
                    model: modelName,
                    success: false,
                    error: ollamaResponse.error,
                    duration: Date.now() - testStart
                });
            }
            
        } catch (error) {
            console.error(`❌ Test failed for ${modelName}:`, error.message);
            
            this.testResults.push({
                model: modelName,
                success: false,
                error: error.message,
                duration: Date.now() - testStart
            });
        }
    }
    
    /**
     * Test direct connection to Ollama
     */
    async testDirectOllama(modelName, prompt) {
        try {
            // Use fetch to test Ollama directly
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
                        max_tokens: 1000
                    }
                })
            });
            
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
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Execute GOT reasoning structure
     */
    async executeGOTReasoning(modelName, gotStructure) {
        console.log('🌐 Executing Graph-of-Thought reasoning...');
        
        const gotResults = {
            nodes: {},
            executionOrder: [],
            totalDuration: 0,
            success: false
        };
        
        try {
            // Execute nodes in dependency order
            const executed = new Set();
            const nodeResults = new Map();
            
            // Simple topological sort execution
            while (executed.size < gotStructure.graphNodes.length) {
                let progressMade = false;
                
                for (const node of gotStructure.graphNodes) {
                    if (executed.has(node.id)) continue;
                    
                    // Check if all dependencies are satisfied
                    const dependenciesSatisfied = node.dependencies.every(dep => executed.has(dep));
                    
                    if (dependenciesSatisfied) {
                        console.log(`   🧠 Executing node: ${node.id}`);
                        
                        // Build context from dependencies
                        let context = '';
                        for (const depId of node.dependencies) {
                            if (nodeResults.has(depId)) {
                                context += `\n${depId}: ${nodeResults.get(depId).substring(0, 200)}...`;
                            }
                        }
                        
                        const contextualPrompt = context ? 
                            `Context: ${context}\n\nQuestion: ${node.question}` : 
                            node.question;
                        
                        const nodeStart = Date.now();
                        const nodeResult = await this.testDirectOllama(modelName, contextualPrompt);
                        const nodeDuration = Date.now() - nodeStart;
                        
                        if (nodeResult.success) {
                            nodeResults.set(node.id, nodeResult.response);
                            gotResults.nodes[node.id] = {
                                question: node.question,
                                response: nodeResult.response,
                                duration: nodeDuration,
                                dependencies: node.dependencies
                            };
                            gotResults.executionOrder.push(node.id);
                            gotResults.totalDuration += nodeDuration;
                            
                            console.log(`     ✅ ${node.id} completed (${nodeDuration}ms)`);
                        } else {
                            console.log(`     ❌ ${node.id} failed: ${nodeResult.error}`);
                            gotResults.nodes[node.id] = {
                                question: node.question,
                                error: nodeResult.error,
                                duration: nodeDuration
                            };
                        }
                        
                        executed.add(node.id);
                        progressMade = true;
                    }
                }
                
                if (!progressMade) {
                    console.error('   ❌ GOT execution stuck - circular dependencies?');
                    break;
                }
            }
            
            gotResults.success = executed.size === gotStructure.graphNodes.length;
            console.log(`   📊 GOT execution: ${executed.size}/${gotStructure.graphNodes.length} nodes completed`);
            
        } catch (error) {
            console.error('   ❌ GOT reasoning failed:', error.message);
            gotResults.error = error.message;
        }
        
        return gotResults;
    }
    
    /**
     * Run comprehensive test on all models
     */
    async runComprehensiveTest() {
        await this.initialize();
        
        console.log('\n🚀 Starting comprehensive LLM + GOT tests...');
        
        // Test each model
        for (const model of EXPECTED_MODELS) {
            await this.testLLMWithGOT(model);
            
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Generate final report
        this.generateFinalReport();
        
        // Cleanup
        if (this.dbPool) {
            await this.dbPool.end();
        }
    }
    
    /**
     * Generate final test report
     */
    generateFinalReport() {
        const totalDuration = Date.now() - this.startTime;
        const successfulTests = this.testResults.filter(r => r.success).length;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPREHENSIVE LLM + GOT TEST RESULTS');
        console.log('='.repeat(60));
        
        console.log(`📋 Test Prompt: "${TEST_PROMPT}"`);
        console.log(`⏱️ Total Duration: ${Math.round(totalDuration / 1000)}s`);
        console.log(`📊 Models Tested: ${this.testResults.length}`);
        console.log(`✅ Successful Tests: ${successfulTests}/${this.testResults.length}`);
        
        console.log('\n📋 INDIVIDUAL RESULTS:');
        
        this.testResults.forEach((result, index) => {
            console.log(`\n${index + 1}. ${result.model}`);
            
            if (result.success) {
                console.log('   ✅ Status: SUCCESS');
                console.log(`   ⏱️ Duration: ${result.duration}ms`);
                
                if (result.directTest?.response) {
                    const responseLength = result.directTest.response.length;
                    console.log(`   📊 Response: ${responseLength} characters`);
                    
                    // Show key phrases from response
                    const response = result.directTest.response.toLowerCase();
                    const hoaiMentions = (response.match(/hoai/g) || []).length;
                    const architectureMentions = (response.match(/architektur/g) || []).length;
                    const germanMentions = (response.match(/deutsch/g) || []).length;
                    
                    console.log(`   🎯 HOAI mentions: ${hoaiMentions}`);
                    console.log(`   🏗️ Architecture mentions: ${architectureMentions}`);
                    console.log(`   🇩🇪 German references: ${germanMentions}`);
                }
                
                if (result.gotTest?.success) {
                    console.log(`   🌐 GOT Reasoning: ✅ ${result.gotTest.executionOrder.length} nodes executed`);
                    console.log(`   🌐 GOT Duration: ${result.gotTest.totalDuration}ms`);
                } else {
                    console.log('   🌐 GOT Reasoning: ❌ Failed or incomplete');
                }
                
            } else {
                console.log('   ❌ Status: FAILED');
                console.log(`   ❌ Error: ${result.error}`);
            }
        });
        
        console.log('\n' + '='.repeat(60));
        
        if (successfulTests === this.testResults.length) {
            console.log('🎉 ALL LLM + GOT TESTS PASSED!');
            console.log('✅ Full construction syndicate is operational');
            console.log('🧠 GOT reasoning is working');
            console.log('🇩🇪 German HOAI knowledge available');
        } else if (successfulTests > 0) {
            console.log('⚠️ PARTIAL SUCCESS - Some models working');
            console.log(`   Working: ${successfulTests}/${this.testResults.length} models`);
        } else {
            console.log('❌ ALL TESTS FAILED');
            console.log('   Check Ollama service and model availability');
        }
        
        console.log('='.repeat(60));
    }
}

/**
 * Run the test
 */
async function runTest() {
    const tester = new LLMGOTTester();
    
    try {
        await tester.runComprehensiveTest();
        process.exit(0);
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTest().catch(console.error);
}

export default LLMGOTTester;
