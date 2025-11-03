#!/usr/bin/env node

/**
 * 🔍 OLLAMA PROCESS MONITOR
 * ========================
 * Deep analysis of Ollama memory usage and qwen2.5 loading behavior
 */

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class OllamaProcessMonitor {
    constructor() {
        this.monitoringActive = false;
        this.measurements = [];
        this.ollamaPID = null;
        this.startTime = Date.now();
    }
    
    /**
     * Find Ollama process PID
     */
    findOllamaPID() {
        try {
            const result = execSync("ps aux | grep 'ollama serve' | grep -v grep | awk '{print $2}'").toString().trim();
            this.ollamaPID = result ? parseInt(result) : null;
            
            if (this.ollamaPID) {
                console.log(`🔍 Found Ollama process: PID ${this.ollamaPID}`);
                return true;
            } else {
                console.log('❌ Ollama process not found');
                return false;
            }
        } catch (error) {
            console.error('❌ Error finding Ollama PID:', error.message);
            return false;
        }
    }
    
    /**
     * Get detailed process information
     */
    getProcessInfo() {
        if (!this.ollamaPID) return null;
        
        try {
            // Get memory info from /proc/PID/status
            const statusInfo = execSync(`cat /proc/${this.ollamaPID}/status | grep -E 'VmSize|VmRSS|VmData|VmStk|VmExe|VmLib|VmPTE|VmSwap'`).toString();
            
            // Get CPU info
            const statInfo = execSync(`cat /proc/${this.ollamaPID}/stat`).toString().split(' ');
            
            // Parse memory values (in KB)
            const memoryInfo = {};
            statusInfo.split('\n').forEach(line => {
                const match = line.match(/(\w+):\s+(\d+)\s+kB/);
                if (match) {
                    memoryInfo[match[1]] = parseInt(match[2]);
                }
            });
            
            // Get file descriptor count
            const fdCount = execSync(`ls /proc/${this.ollamaPID}/fd/ | wc -l`).toString().trim();
            
            return {
                pid: this.ollamaPID,
                memory: {
                    virtualSize: memoryInfo.VmSize || 0,      // Total virtual memory
                    residentSet: memoryInfo.VmRSS || 0,       // Physical memory used
                    dataSegment: memoryInfo.VmData || 0,      // Data segment size
                    stackSize: memoryInfo.VmStk || 0,         // Stack size
                    executableSize: memoryInfo.VmExe || 0,    // Executable size
                    librarySize: memoryInfo.VmLib || 0,       // Shared library size
                    pageTable: memoryInfo.VmPTE || 0,         // Page table size
                    swapUsed: memoryInfo.VmSwap || 0          // Swap space used
                },
                cpu: {
                    userTime: parseInt(statInfo[13]),         // User CPU time
                    systemTime: parseInt(statInfo[14]),       // System CPU time
                    priority: parseInt(statInfo[17]),         // Priority
                    threads: parseInt(statInfo[19])           // Number of threads
                },
                fileDescriptors: parseInt(fdCount),
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error(`❌ Error getting process info for PID ${this.ollamaPID}:`, error.message);
            return null;
        }
    }
    
    /**
     * Monitor Ollama during model loading
     */
    async monitorDuringModelLoad(modelName) {
        console.log(`\n🔍 MONITORING OLLAMA DURING ${modelName} LOADING`);
        console.log('='.repeat(50));
        
        if (!this.findOllamaPID()) {
            throw new Error('Ollama process not found');
        }
        
        // Get baseline measurements
        const baseline = this.getProcessInfo();
        if (baseline) {
            console.log('📊 BASELINE MEASUREMENTS:');
            console.log(`   Virtual Memory: ${(baseline.memory.virtualSize / 1024).toFixed(1)} MB`);
            console.log(`   Resident Memory: ${(baseline.memory.residentSet / 1024).toFixed(1)} MB`);
            console.log(`   Data Segment: ${(baseline.memory.dataSegment / 1024).toFixed(1)} MB`);
            console.log(`   Threads: ${baseline.cpu.threads}`);
            console.log(`   File Descriptors: ${baseline.fileDescriptors}`);
        }
        
        // Start monitoring
        this.monitoringActive = true;
        const monitoringInterval = setInterval(() => {
            if (!this.monitoringActive) {
                clearInterval(monitoringInterval);
                return;
            }
            
            const info = this.getProcessInfo();
            if (info) {
                this.measurements.push(info);
                
                // Log significant changes
                if (baseline && this.measurements.length % 10 === 0) {
                    const current = info;
                    const memoryChange = (current.memory.residentSet - baseline.memory.residentSet) / 1024; // MB
                    const threadChange = current.cpu.threads - baseline.cpu.threads;
                    
                    console.log(`📊 [${Math.floor((Date.now() - this.startTime) / 1000)}s] Memory: +${memoryChange.toFixed(1)}MB, Threads: +${threadChange}`);
                    
                    // Alert on significant memory increase
                    if (memoryChange > 50000) { // >50GB increase
                        console.log(`🚨 ALERT: Large memory increase detected (+${memoryChange.toFixed(1)}MB)`);
                    }
                }
            }
        }, 1000); // Monitor every second
        
        return monitoringInterval;
    }
    
    /**
     * Test specific model with monitoring
     */
    async testModelWithMonitoring(modelName) {
        console.log(`\n🧠 TESTING ${modelName} WITH DEEP MONITORING`);
        console.log('='.repeat(60));
        
        // Start monitoring
        const monitorInterval = await this.monitorDuringModelLoad(modelName);
        
        const testStart = Date.now();
        
        try {
            // Test simple prompt first
            console.log('📝 Testing simple prompt...');
            const simpleResult = await this.testOllamaRequest(modelName, 'Hello');
            
            if (simpleResult.success) {
                console.log(`✅ Simple test: ${simpleResult.duration}ms`);
                
                // Test German HOAI prompt
                console.log('📝 Testing German HOAI prompt...');
                const hoaiResult = await this.testOllamaRequest(
                    modelName, 
                    "was ist besonders and deutscher architektur nach der HOAI ??!"
                );
                
                if (hoaiResult.success) {
                    console.log(`✅ HOAI test: ${hoaiResult.duration}ms`);
                    console.log(`📊 Response length: ${hoaiResult.response?.length || 0} chars`);
                    
                    // Show German architectural terms found
                    const response = hoaiResult.response?.toLowerCase() || '';
                    const hoaiCount = (response.match(/hoai/g) || []).length;
                    const archCount = (response.match(/architektur/g) || []).length;
                    const deutschCount = (response.match(/deutsch/g) || []).length;
                    
                    console.log(`🇩🇪 German terms found: HOAI(${hoaiCount}), Architektur(${archCount}), Deutsch(${deutschCount})`);
                    
                } else {
                    console.log(`❌ HOAI test failed: ${hoaiResult.error}`);
                }
                
            } else {
                console.log(`❌ Simple test failed: ${simpleResult.error}`);
            }
            
        } catch (error) {
            console.error(`❌ Model test failed: ${error.message}`);
        } finally {
            // Stop monitoring
            this.monitoringActive = false;
            clearInterval(monitorInterval);
            
            // Generate monitoring report
            this.generateMonitoringReport(modelName, Date.now() - testStart);
        }
    }
    
    /**
     * Test Ollama request with timeout
     */
    async testOllamaRequest(modelName, prompt, timeoutMs = 120000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const requestStart = Date.now();
        
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelName,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        num_predict: 500
                    }
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                    duration: Date.now() - requestStart
                };
            }
            
            const data = await response.json();
            
            return {
                success: true,
                response: data.response,
                duration: Date.now() - requestStart,
                loadDuration: data.load_duration,
                evalCount: data.eval_count,
                evalDuration: data.eval_duration
            };
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: `Timeout after ${timeoutMs}ms`,
                    duration: timeoutMs
                };
            }
            
            return {
                success: false,
                error: error.message,
                duration: Date.now() - requestStart
            };
        }
    }
    
    /**
     * Generate monitoring report
     */
    generateMonitoringReport(modelName, testDuration) {
        if (this.measurements.length === 0) {
            console.log('⚠️ No monitoring data collected');
            return;
        }
        
        console.log(`\n📊 MONITORING REPORT FOR ${modelName}`);
        console.log('='.repeat(50));
        
        const baseline = this.measurements[0];
        const final = this.measurements[this.measurements.length - 1];
        
        // Memory analysis
        const memoryGrowth = {
            virtual: (final.memory.virtualSize - baseline.memory.virtualSize) / 1024, // MB
            resident: (final.memory.residentSet - baseline.memory.residentSet) / 1024, // MB
            data: (final.memory.dataSegment - baseline.memory.dataSegment) / 1024, // MB
            swap: (final.memory.swapUsed - baseline.memory.swapUsed) / 1024 // MB
        };
        
        console.log('💾 MEMORY ANALYSIS:');
        console.log(`   Virtual Memory Growth: ${memoryGrowth.virtual > 0 ? '+' : ''}${memoryGrowth.virtual.toFixed(1)} MB`);
        console.log(`   Resident Memory Growth: ${memoryGrowth.resident > 0 ? '+' : ''}${memoryGrowth.resident.toFixed(1)} MB`);
        console.log(`   Data Segment Growth: ${memoryGrowth.data > 0 ? '+' : ''}${memoryGrowth.data.toFixed(1)} MB`);
        console.log(`   Swap Usage Change: ${memoryGrowth.swap > 0 ? '+' : ''}${memoryGrowth.swap.toFixed(1)} MB`);
        
        // Thread analysis
        const threadChange = final.cpu.threads - baseline.cpu.threads;
        console.log(`   Thread Count Change: ${threadChange > 0 ? '+' : ''}${threadChange}`);
        
        // Peak usage
        const peakResident = Math.max(...this.measurements.map(m => m.memory.residentSet));
        const peakVirtual = Math.max(...this.measurements.map(m => m.memory.virtualSize));
        
        console.log('\n📈 PEAK USAGE:');
        console.log(`   Peak Resident: ${(peakResident / 1024 / 1024).toFixed(2)} GB`);
        console.log(`   Peak Virtual: ${(peakVirtual / 1024 / 1024).toFixed(2)} GB`);
        
        // Performance indicators
        console.log('\n⚡ PERFORMANCE INDICATORS:');
        console.log(`   Test Duration: ${Math.round(testDuration / 1000)}s`);
        console.log(`   Monitoring Samples: ${this.measurements.length}`);
        console.log(`   Sample Rate: ${(this.measurements.length / (testDuration / 1000)).toFixed(1)} samples/sec`);
        
        // Assess health
        console.log('\n🏥 HEALTH ASSESSMENT:');
        
        if (memoryGrowth.resident > 50000) { // >50GB growth
            console.log('❌ CRITICAL: Excessive memory growth detected');
            console.log(`   Growth: ${memoryGrowth.resident.toFixed(1)}MB`);
            console.log('   Recommendation: Consider Q4 quantization instead of F16');
        } else if (memoryGrowth.resident > 10000) { // >10GB growth
            console.log('⚠️ WARNING: High memory usage detected');
        } else {
            console.log('✅ Memory usage appears normal');
        }
        
        if (testDuration > 60000) { // >1 minute
            console.log('❌ CRITICAL: Response time too slow');
            console.log('   Recommendation: Check model loading and configuration');
        } else if (testDuration > 30000) { // >30 seconds
            console.log('⚠️ WARNING: Response time slower than optimal');
        } else {
            console.log('✅ Response time acceptable');
        }
        
        if (memoryGrowth.swap > 0) {
            console.log('❌ CRITICAL: Swap usage detected - memory pressure');
        }
    }
    
    /**
     * Compare all models
     */
    async compareAllModels() {
        const models = [
            'phi3:14b',           // Smallest, should be fastest
            'mistral:7b-instruct-fp16',
            'llama3.3:70b',
            'llava:34b',
            'qwen2.5:72b-instruct-fp16'  // Largest, problem child
        ];
        
        console.log('🧠 COMPREHENSIVE MODEL COMPARISON');
        console.log('='.repeat(50));
        
        const results = [];
        
        for (const model of models) {
            console.log(`\n🔍 Testing ${model}...`);
            
            // Reset measurements for each model
            this.measurements = [];
            
            const modelStart = Date.now();
            await this.testModelWithMonitoring(model);
            const modelDuration = Date.now() - modelStart;
            
            // Wait between models to let memory settle
            console.log('⏳ Waiting 30 seconds between models...');
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            results.push({
                model,
                duration: modelDuration,
                measurements: [...this.measurements]
            });
        }
        
        // Generate comparison report
        console.log('\n📊 MODEL COMPARISON SUMMARY');
        console.log('='.repeat(50));
        
        results.forEach((result, index) => {
            const avgMemory = result.measurements.length > 0 ?
                result.measurements.reduce((sum, m) => sum + m.memory.residentSet, 0) / result.measurements.length / 1024 / 1024 :
                0;
            
            console.log(`${index + 1}. ${result.model}`);
            console.log(`   Duration: ${Math.round(result.duration / 1000)}s`);
            console.log(`   Avg Memory: ${avgMemory.toFixed(2)} GB`);
            console.log(`   Samples: ${result.measurements.length}`);
        });
        
        // Identify the problem
        const qwen25Result = results.find(r => r.model.includes('qwen2.5'));
        const fastestResult = results.reduce((fastest, current) => 
            current.duration < fastest.duration ? current : fastest
        );
        
        if (qwen25Result && fastestResult) {
            const slowdownRatio = qwen25Result.duration / fastestResult.duration;
            console.log(`\n🔍 ANALYSIS:`);
            console.log(`   Fastest model: ${fastestResult.model} (${Math.round(fastestResult.duration / 1000)}s)`);
            console.log(`   qwen2.5 performance: ${Math.round(qwen25Result.duration / 1000)}s`);
            console.log(`   Slowdown ratio: ${slowdownRatio.toFixed(1)}x slower`);
            
            if (slowdownRatio > 10) {
                console.log('❌ CRITICAL: qwen2.5 is severely underperforming');
                console.log('   ROOT CAUSE LIKELY: F16 quantization + 145GB model size');
                console.log('   RECOMMENDATION: Switch to Q4 quantization');
            }
        }
    }
}

/**
 * Run monitoring analysis
 */
async function runAnalysis() {
    const monitor = new OllamaProcessMonitor();
    
    try {
        // Test if Ollama is running
        if (!monitor.findOllamaPID()) {
            console.error('❌ Ollama is not running. Please start it first.');
            process.exit(1);
        }
        
        // Run comprehensive comparison
        await monitor.compareAllModels();
        
        console.log('\n✅ Deep analysis complete');
        console.log('📋 Check the results above for qwen2.5 performance issues');
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAnalysis().catch(console.error);
}

export default OllamaProcessMonitor;
