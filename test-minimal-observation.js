#!/usr/bin/env node

/**
 * 🧪 MINIMAL OBSERVATION MODE VALIDATOR
 * =====================================
 * Quick 30-second test to verify ultra-minimal startup works
 */

import { spawn } from 'child_process';
import v8 from 'v8';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration - MUCH more aggressive
const TEST_DURATION = 30000; // 30 seconds only
const MAX_LOGS_PER_MINUTE = 2; // Even stricter
const MAX_SERVICES_LOADED = 10; // Must be minimal
const MIN_HEAP_GB = 350; // Minimum acceptable heap

class MinimalObservationValidator {
    constructor() {
        this.logCount = 0;
        this.servicesLoaded = 0;
        this.violations = [];
        this.startTime = Date.now();
        this.syndicateProcess = null;
        this.heapDetected = false;
        this.heapSizeGB = 0;
    }
    
    /**
     * Start the minimal observation mode
     */
    async startMinimalMode() {
        console.log('🚀 Starting MINIMAL observation mode...\n');
        
        const scriptPath = join(__dirname, 'force-heap-before-node.sh');
        
        this.syndicateProcess = spawn('bash', [scriptPath], {
            env: {
                ...process.env,
                OBSERVATION_MODE_ENFORCED: 'true',
                SKIP_ALL_SERVICES: 'true',
                MINIMAL_MODE: 'true'
            }
        });
        
        // Monitor output with strict analysis
        this.syndicateProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    this.analyzeLogLine(line);
                }
            });
        });
        
        this.syndicateProcess.stderr.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    this.analyzeLogLine(line, true);
                }
            });
        });
        
        this.syndicateProcess.on('exit', (code, signal) => {
            if (code !== 0) {
                this.violations.push({
                    type: 'CRASH',
                    message: `Process crashed with code ${code}, signal ${signal}`,
                    timestamp: Date.now()
                });
            }
        });
        
        // Wait for startup (should be fast!)
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    /**
     * Analyze each log line for violations
     */
    analyzeLogLine(line, isError = false) {
        const timestamp = Date.now();
        this.logCount++;
        
        // Extract heap info
        const heapMatch = line.match(/Node Heap Limit:\s*([\d.]+)GB/);
        if (heapMatch) {
            this.heapSizeGB = parseFloat(heapMatch[1]);
            this.heapDetected = true;
            console.log(`📊 Detected heap: ${this.heapSizeGB}GB`);
        }
        
        // Count services being loaded
        if (line.includes('Loaded') || line.includes('initialized') || line.includes('registered')) {
            this.servicesLoaded++;
        }
        
        // Check for VIOLATIONS (these should NOT happen in minimal mode)
        if (line.includes('Evolution') && !line.includes('Disabled') && !line.includes('Skipping')) {
            this.violations.push({
                type: 'EVOLUTION_VIOLATION',
                message: line.substring(0, 100),
                timestamp
            });
        }
        
        if (line.includes('overtraining') && !line.includes('Disabled') && !line.includes('prevention')) {
            this.violations.push({
                type: 'OVERTRAINING_VIOLATION',
                message: line.substring(0, 100),
                timestamp
            });
        }
        
        if (line.includes('entanglement') && !line.includes('Disabled') && !line.includes('Skipping')) {
            this.violations.push({
                type: 'ENTANGLEMENT_VIOLATION',
                message: line.substring(0, 100),
                timestamp
            });
        }
        
        if (line.includes('Learning Systems') || line.includes('Quantum Systems')) {
            this.violations.push({
                type: 'HEAVY_SYSTEM_LOADING',
                message: line.substring(0, 100),
                timestamp
            });
        }
        
        // Show only essential logs during test
        if (line.includes('✅') || line.includes('❌') || line.includes('🔭') || line.includes('📊')) {
            console.log(`   ${line}`);
        }
        
        if (isError) {
            console.error(`❌ ERROR: ${line}`);
        }
    }
    
    /**
     * Analyze results with strict criteria
     */
    analyzeResults() {
        const duration = Date.now() - this.startTime;
        const minutes = duration / 60000;
        const logsPerMinute = this.logCount / minutes;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 MINIMAL OBSERVATION MODE VALIDATION');
        console.log('='.repeat(60));
        
        let passed = true;
        
        // 1. Log rate test (stricter)
        console.log('\n📈 LOG RATE TEST:');
        console.log(`   Total logs: ${this.logCount}`);
        console.log(`   Duration: ${minutes.toFixed(2)} minutes`);
        console.log(`   Logs per minute: ${logsPerMinute.toFixed(1)}`);
        
        if (logsPerMinute <= MAX_LOGS_PER_MINUTE) {
            console.log(`   ✅ PASSED: Below ${MAX_LOGS_PER_MINUTE} logs/min threshold`);
        } else {
            console.log(`   ❌ FAILED: Exceeds ${MAX_LOGS_PER_MINUTE} logs/min threshold`);
            passed = false;
        }
        
        // 2. Heap allocation test
        console.log('\n💾 HEAP ALLOCATION TEST:');
        if (this.heapDetected) {
            console.log(`   Detected heap: ${this.heapSizeGB}GB`);
            if (this.heapSizeGB >= MIN_HEAP_GB) {
                console.log(`   ✅ PASSED: Heap >= ${MIN_HEAP_GB}GB`);
            } else {
                console.log(`   ❌ FAILED: Heap < ${MIN_HEAP_GB}GB`);
                passed = false;
            }
        } else {
            console.log('   ❌ FAILED: No heap size detected');
            passed = false;
        }
        
        // 3. Service loading test
        console.log('\n🔧 SERVICE LOADING TEST:');
        console.log(`   Services loaded: ${this.servicesLoaded}`);
        if (this.servicesLoaded <= MAX_SERVICES_LOADED) {
            console.log(`   ✅ PASSED: Services <= ${MAX_SERVICES_LOADED}`);
        } else {
            console.log(`   ❌ FAILED: Too many services loaded (${this.servicesLoaded})`);
            passed = false;
        }
        
        // 4. Violations test
        console.log('\n🚨 VIOLATIONS TEST:');
        if (this.violations.length === 0) {
            console.log('   ✅ PASSED: No violations detected');
        } else {
            console.log(`   ❌ FAILED: ${this.violations.length} violations found`);
            passed = false;
            
            // Show violation types
            const violationTypes = {};
            this.violations.forEach(v => {
                violationTypes[v.type] = (violationTypes[v.type] || 0) + 1;
            });
            
            Object.entries(violationTypes).forEach(([type, count]) => {
                console.log(`      ${type}: ${count} occurrences`);
            });
        }
        
        // Overall result
        console.log('\n' + '='.repeat(60));
        if (passed) {
            console.log('🎉 MINIMAL OBSERVATION MODE VALIDATION PASSED');
            console.log('✅ System successfully achieved TRUE observation/idle mode');
        } else {
            console.log('❌ MINIMAL OBSERVATION MODE VALIDATION FAILED');
            console.log('🔥 System still has architectural issues');
        }
        console.log('='.repeat(60));
        
        return passed;
    }
    
    /**
     * Run the validation
     */
    async run() {
        console.log('🧪 MINIMAL OBSERVATION MODE VALIDATOR');
        console.log('=====================================');
        console.log('STRICT CRITERIA:');
        console.log(`• Max ${MAX_LOGS_PER_MINUTE} logs/minute`);
        console.log(`• Max ${MAX_SERVICES_LOADED} services loaded`);
        console.log(`• Min ${MIN_HEAP_GB}GB heap allocation`);
        console.log(`• Zero background process violations`);
        console.log('=====================================\n');
        
        try {
            // Start minimal mode
            await this.startMinimalMode();
            
            console.log('⏱️ Running 30-second validation...\n');
            
            // Run test
            await new Promise(resolve => setTimeout(resolve, TEST_DURATION));
            
            // Stop process
            console.log('\n🛑 Stopping test...');
            if (this.syndicateProcess) {
                this.syndicateProcess.kill('SIGTERM');
                await new Promise(resolve => setTimeout(resolve, 3000));
                if (this.syndicateProcess.exitCode === null) {
                    this.syndicateProcess.kill('SIGKILL');
                }
            }
            
            // Analyze results
            const passed = this.analyzeResults();
            
            process.exit(passed ? 0 : 1);
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            process.exit(1);
        }
    }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new MinimalObservationValidator();
    validator.run().catch(console.error);
}

export default MinimalObservationValidator;
