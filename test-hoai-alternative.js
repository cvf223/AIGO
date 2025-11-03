#!/usr/bin/env node

/**
 * 🧠 HOAI TEST WITH ALTERNATIVE WORDING (AVOIDING "ARCHITECTURE")
 * ==============================================================
 * Tests German HOAI knowledge using alternative terminology
 */

const ALTERNATIVE_PROMPTS = [
    // Original (will likely hang)
    "was ist besonders and deutscher architektur nach der HOAI ??!",
    
    // Alternative wordings avoiding "architecture"
    "was ist besonders an deutschen Gebäuden nach der HOAI?",
    "was macht deutsche Bauweise nach HOAI besonders?", 
    "welche Besonderheiten haben deutsche Bauprojekte nach HOAI?",
    "was ist die HOAI und wie beeinflusst sie deutsches Bauen?",
    "was sind die HOAI Regelungen für deutsche Bauprojekte?",
];

const MODELS_TO_TEST = [
    'phi3:14b',
    'mistral:7b-instruct-fp16'
];

class HOAIAlternativeTester {
    constructor() {
        this.results = [];
    }
    
    /**
     * Test single prompt with timeout
     */
    async testPrompt(model, prompt, timeoutMs = 20000) {
        console.log(`🧠 Testing: ${model}`);
        console.log(`📋 Prompt: "${prompt}"`);
        console.log('-'.repeat(50));
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        max_tokens: 200,
                        temperature: 0.7
                    }
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const duration = Math.round((data.total_duration || 0) / 1000000);
                
                console.log(`✅ Success (${duration}ms)`);
                console.log(`📊 Response length: ${data.response?.length || 0} chars`);
                
                if (data.response) {
                    const preview = data.response.substring(0, 150).replace(/\n/g, ' ');
                    console.log(`📋 Preview: "${preview}..."`);
                    
                    // Check for HOAI mentions
                    const hoaiCount = (data.response.toLowerCase().match(/hoai/g) || []).length;
                    console.log(`🎯 HOAI mentions: ${hoaiCount}`);
                }
                
                return {
                    success: true,
                    response: data.response,
                    duration: duration,
                    model: model,
                    prompt: prompt
                };
            } else {
                console.log(`❌ HTTP Error: ${response.status}`);
                return { success: false, error: `HTTP ${response.status}` };
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`❌ Timeout (>${timeoutMs/1000}s)`);
                return { success: false, error: 'Timeout' };
            } else {
                console.log(`❌ Error: ${error.message}`);
                return { success: false, error: error.message };
            }
        }
    }
    
    /**
     * Run comprehensive test
     */
    async runTest() {
        console.log('🧠 HOAI ALTERNATIVE WORDING TEST');
        console.log('='.repeat(60));
        console.log('Testing German HOAI knowledge with alternative terminology');
        console.log('(avoiding the problematic word "Architektur/Architecture")');
        console.log('='.repeat(60));
        
        let successCount = 0;
        let testCount = 0;
        
        for (const prompt of ALTERNATIVE_PROMPTS) {
            for (const model of MODELS_TO_TEST) {
                testCount++;
                console.log(`\n🧠 TEST ${testCount}: ${model}`);
                
                const result = await this.testPrompt(model, prompt);
                this.results.push({
                    ...result,
                    testNumber: testCount
                });
                
                if (result.success) {
                    successCount++;
                }
                
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            console.log('\n' + '─'.repeat(30));
        }
        
        // Generate summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Successful tests: ${successCount}/${testCount}`);
        console.log(`📋 Alternative prompts tested: ${ALTERNATIVE_PROMPTS.length}`);
        console.log(`🤖 Models tested: ${MODELS_TO_TEST.length}`);
        
        if (successCount > 0) {
            console.log('\n🎉 WORKING ALTERNATIVES FOUND:');
            this.results.filter(r => r.success).forEach((result, index) => {
                console.log(`\n${index + 1}. ✅ ${result.model}`);
                console.log(`   📋 "${result.prompt}"`);
                console.log(`   ⏱️ ${result.duration}ms`);
                if (result.response) {
                    const preview = result.response.substring(0, 100).replace(/\n/g, ' ');
                    console.log(`   📄 "${preview}..."`);
                }
            });
        } else {
            console.log('\n❌ No working alternatives found');
            console.log('   The issue may be deeper than just the word "architecture"');
        }
        
        console.log('='.repeat(60));
    }
}

/**
 * Run if called directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new HOAIAlternativeTester();
    tester.runTest().catch(console.error);
}

export default HOAIAlternativeTester;
