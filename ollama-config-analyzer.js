#!/usr/bin/env node

/**
 * ⚙️ OLLAMA CONFIGURATION ANALYZER  
 * ================================
 * Deep analysis of Ollama configuration for large model optimization
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class OllamaConfigAnalyzer {
    constructor() {
        this.configData = {};
        this.recommendations = [];
    }
    
    /**
     * Analyze current Ollama configuration
     */
    async analyzeCurrentConfig() {
        console.log('⚙️ OLLAMA CONFIGURATION ANALYSIS');
        console.log('='.repeat(50));
        
        try {
            // Get Ollama service configuration
            console.log('🔍 Checking Ollama service configuration...');
            
            const serviceConfig = execSync('systemctl show ollama.service --no-pager').toString();
            const serviceStatus = execSync('systemctl status ollama.service --no-pager -l').toString();
            
            // Parse environment variables from service
            const envVars = {};
            serviceStatus.split('\n').forEach(line => {
                const envMatch = line.match(/OLLAMA_([A-Z_]+):\s*(.+)/);
                if (envMatch) {
                    envVars[`OLLAMA_${envMatch[1]}`] = envMatch[2];
                }
            });
            
            console.log('📋 CURRENT OLLAMA CONFIGURATION:');
            Object.entries(envVars).forEach(([key, value]) => {
                console.log(`   ${key}: ${value}`);
                
                // Analyze each setting
                this.analyzeConfigSetting(key, value);
            });
            
            // Check system resource limits
            console.log('\n🔍 Checking system resource limits...');
            
            const ulimits = execSync('ulimit -a').toString();
            console.log('📋 SYSTEM LIMITS:');
            console.log(ulimits);
            
            // Check memory info
            const meminfo = execSync('cat /proc/meminfo | head -10').toString();
            console.log('\n💾 SYSTEM MEMORY INFO:');
            console.log(meminfo);
            
            // Store configuration data
            this.configData = {
                environment: envVars,
                systemLimits: ulimits,
                memoryInfo: meminfo,
                serviceConfig: serviceConfig
            };
            
        } catch (error) {
            console.error('❌ Configuration analysis failed:', error.message);
        }
    }
    
    /**
     * Analyze individual configuration setting
     */
    analyzeConfigSetting(key, value) {
        switch (key) {
            case 'OLLAMA_CONTEXT_LENGTH':
                if (parseInt(value) < 8192) {
                    this.recommendations.push({
                        type: 'CRITICAL',
                        setting: key,
                        current: value,
                        recommended: '8192',
                        reason: 'Small context length limits large model performance'
                    });
                }
                break;
                
            case 'OLLAMA_MAX_LOADED_MODELS':
                if (parseInt(value) === 0) {
                    this.recommendations.push({
                        type: 'WARNING',
                        setting: key,
                        current: value,
                        recommended: '2',
                        reason: 'Unlimited model loading can cause memory pressure'
                    });
                }
                break;
                
            case 'OLLAMA_LOAD_TIMEOUT':
                if (!value || parseInt(value.replace(/[ms]/g, '')) < 300000) {
                    this.recommendations.push({
                        type: 'CRITICAL',
                        setting: key,
                        current: value || 'default (5m)',
                        recommended: '10m',
                        reason: 'Large models like qwen2.5 F16 need longer load timeout'
                    });
                }
                break;
                
            case 'OLLAMA_NUM_PARALLEL':
                if (parseInt(value) > 1) {
                    this.recommendations.push({
                        type: 'WARNING',
                        setting: key,
                        current: value,
                        recommended: '1',
                        reason: 'Parallel processing conflicts with large model memory needs'
                    });
                }
                break;
        }
    }
    
    /**
     * Create optimized Ollama configuration
     */
    createOptimizedConfig() {
        console.log('\n🛠️ OPTIMIZED CONFIGURATION GENERATOR');
        console.log('='.repeat(45));
        
        const optimizedConfig = `# OPTIMIZED OLLAMA CONFIGURATION FOR 896GB SYSTEM
# Specifically tuned for qwen2.5:72b-instruct-fp16 (145GB F16)

[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_CONTEXT_LENGTH=8192"
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_LOAD_TIMEOUT=15m"
Environment="OLLAMA_MAX_LOADED_MODELS=2"
Environment="OLLAMA_KEEP_ALIVE=10m"
Environment="OLLAMA_MAX_QUEUE=32"
Environment="OLLAMA_FLASH_ATTENTION=true"
Environment="OLLAMA_GPU_OVERHEAD=0"
Environment="OLLAMA_DEBUG=INFO"

# Memory optimization for large models
LimitMEMLOCK=infinity
LimitNOFILE=65536

# Process priority for large models
Nice=0
IOSchedulingClass=1
IOSchedulingPriority=4`;

        console.log('📝 Generated optimized configuration:');
        console.log('   File: /etc/systemd/system/ollama.service.d/large-models.conf');
        console.log('   Optimizations: Context length, timeouts, parallel processing');
        console.log('   Target: 145GB F16 model support');
        
        return optimizedConfig;
    }
    
    /**
     * Diagnose specific qwen2.5 issues
     */
    async diagnoseQwen25Issues() {
        console.log('\n🔍 DIAGNOSING qwen2.5 SPECIFIC ISSUES');
        console.log('='.repeat(45));
        
        try {
            // Test if qwen2.5 is actually loaded
            console.log('🧪 Testing if qwen2.5 is loaded in memory...');
            
            const loadTest = await this.testModelLoad('qwen2.5:72b-instruct-fp16');
            
            if (loadTest.success) {
                console.log('✅ qwen2.5 loads successfully');
                console.log(`   Load duration: ${loadTest.loadDuration}ns`);
                console.log(`   Eval duration: ${loadTest.evalDuration}ns`);
            } else {
                console.log('❌ qwen2.5 loading fails');
                console.log(`   Error: ${loadTest.error}`);
            }
            
            // Compare with working model
            console.log('\n🧪 Comparing with working model (phi3:14b)...');
            const phi3Test = await this.testModelLoad('phi3:14b');
            
            if (phi3Test.success && loadTest.success) {
                const loadRatio = (loadTest.loadDuration || 0) / (phi3Test.loadDuration || 1);
                const evalRatio = (loadTest.evalDuration || 0) / (phi3Test.evalDuration || 1);
                
                console.log('📊 PERFORMANCE COMPARISON:');
                console.log(`   qwen2.5 load time: ${loadTest.loadDuration}ns`);
                console.log(`   phi3 load time: ${phi3Test.loadDuration}ns`);
                console.log(`   Load ratio: qwen2.5 is ${loadRatio.toFixed(1)}x slower to load`);
                console.log(`   Eval ratio: qwen2.5 is ${evalRatio.toFixed(1)}x slower to evaluate`);
                
                if (loadRatio > 10) {
                    console.log('❌ CRITICAL: qwen2.5 loading is severely slow');
                    this.recommendations.push({
                        type: 'CRITICAL',
                        issue: 'Model loading performance',
                        current: 'F16 quantization causing severe slowdown',
                        recommended: 'Switch to Q4 quantization',
                        impact: `${loadRatio.toFixed(1)}x performance improvement expected`
                    });
                }
            }
            
        } catch (error) {
            console.error('❌ qwen2.5 diagnosis failed:', error.message);
        }
    }
    
    /**
     * Test model loading with detailed timing
     */
    async testModelLoad(modelName) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
        
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelName,
                    prompt: 'Test',
                    stream: false,
                    options: { num_predict: 1 }
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                return { success: false, error: `HTTP ${response.status}` };
            }
            
            const data = await response.json();
            
            return {
                success: true,
                loadDuration: data.load_duration,
                evalDuration: data.eval_duration,
                response: data.response
            };
            
        } catch (error) {
            clearTimeout(timeoutId);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Run complete configuration analysis
     */
    async runCompleteAnalysis() {
        console.log('⚙️ COMPREHENSIVE OLLAMA CONFIGURATION ANALYSIS');
        console.log('='.repeat(60));
        
        // Analyze current config
        await this.analyzeCurrentConfig();
        
        // Diagnose qwen2.5 specific issues
        await this.diagnoseQwen25Issues();
        
        // Generate recommendations
        console.log('\n💡 CONFIGURATION RECOMMENDATIONS');
        console.log('='.repeat(45));
        
        if (this.recommendations.length === 0) {
            console.log('✅ Configuration appears optimal');
        } else {
            this.recommendations.forEach((rec, index) => {
                console.log(`\n${index + 1}. ${rec.type}: ${rec.setting || rec.issue}`);
                console.log(`   Current: ${rec.current}`);
                console.log(`   Recommended: ${rec.recommended}`);
                console.log(`   Reason: ${rec.reason || rec.impact}`);
            });
        }
        
        // Create optimized configuration
        const optimizedConfig = this.createOptimizedConfig();
        
        // Generate quick fix script
        const quickFix = this.generateQuickFix();
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. Apply the optimized configuration');
        console.log('2. Replace F16 model with Q4 quantization');  
        console.log('3. Restart Ollama service');
        console.log('4. Test qwen2.5 performance');
        
        return {
            config: optimizedConfig,
            quickFix: quickFix,
            recommendations: this.recommendations
        };
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const analyzer = new OllamaConfigAnalyzer();
    analyzer.runCompleteAnalysis().catch(console.error);
}

export default OllamaConfigAnalyzer;
