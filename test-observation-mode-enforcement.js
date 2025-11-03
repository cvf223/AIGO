#!/usr/bin/env node

/**
 * 🧪 OBSERVATION MODE ENFORCEMENT VALIDATOR
 * ========================================
 * Tests that observation mode properly stops all background processes
 * and maintains stable heap usage
 */

import { spawn } from 'child_process';
import v8 from 'v8';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_DURATION = 60000; // 1 minute test
const LOG_THRESHOLD = 5; // Max logs per minute in observation mode
const HEAP_VARIANCE_THRESHOLD = 0.01; // Max 1% heap variance

class ObservationModeValidator {
    constructor() {
        this.logCount = 0;
        this.heapSamples = [];
        this.violations = [];
        this.startTime = Date.now();
        this.syndicateProcess = null;
    }
    
    /**
     * Start the syndicate in observation mode
     */
    async startSyndicate() {
        console.log('🚀 Starting syndicate in observation mode...\n');
        
        const scriptPath = join(__dirname, 'start-with-enforced-heap.js');
        
        this.syndicateProcess = spawn('node', [scriptPath], {
            env: {
                ...process.env,
                OBSERVATION_MODE_ENFORCED: 'true',
                SKIP_AUTONOMOUS_SYSTEMS: 'true',
                DISABLE_DEBUG_LOGGING: 'true'
            }
        });
        
        // Monitor output
        this.syndicateProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    this.processLogLine(line);
                }
            });
        });
        
        this.syndicateProcess.stderr.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    this.processLogLine(line, true);
                }
            });
        });
        
        this.syndicateProcess.on('exit', (code, signal) => {
            if (code !== 0) {
                this.violations.push({
                    type: 'CRASH',
                    message: `Process exited with code ${code}, signal ${signal}`,
                    timestamp: Date.now()
                });
            }
        });
        
        // Wait for startup
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    /**
     * Process a log line
     */
    processLogLine(line, isError = false) {
        const timestamp = Date.now();
        const elapsed = timestamp - this.startTime;
        
        // Count logs
        this.logCount++;
        
        // Check for violations
        if (line.includes('Evolution') && !line.includes('Skipping')) {
            this.violations.push({
                type: 'EVOLUTION_RUNNING',
                message: line,
                timestamp
            });
        }
        
        if (line.includes('entanglement') && !line.includes('Skipping')) {
            this.violations.push({
                type: 'ENTANGLEMENT_RUNNING',
                message: line,
                timestamp
            });
        }
        
        if (line.includes('overtraining') && !line.includes('prevented')) {
            this.violations.push({
                type: 'OVERTRAINING_ACTIVE',
                message: line,
                timestamp
            });
        }
        
        // Extract heap info if present
        const heapMatch = line.match(/Heap:\s*(\d+)MB\s*\/\s*(\d+)MB/);
        if (heapMatch) {
            this.heapSamples.push({
                used: parseInt(heapMatch[1]),
                total: parseInt(heapMatch[2]),
                timestamp
            });
        }
        
        // Log errors
        if (isError) {
            console.error(`❌ ERROR: ${line}`);
        } else if (elapsed < 30000) {
            // Only show logs for first 30 seconds
            console.log(`   ${line}`);
        }
    }
    
    /**
     * Analyze results
     */
    analyzeResults() {
        const duration = Date.now() - this.startTime;
        const minutes = duration / 60000;
        const logsPerMinute = this.logCount / minutes;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 OBSERVATION MODE VALIDATION RESULTS');
        console.log('='.repeat(60));
        
        // Log rate analysis
        console.log('\n📈 LOG RATE ANALYSIS:');
        console.log(`   Total logs: ${this.logCount}`);
        console.log(`   Duration: ${minutes.toFixed(2)} minutes`);
        console.log(`   Logs per minute: ${logsPerMinute.toFixed(1)}`);
        
        if (logsPerMinute > LOG_THRESHOLD) {
            console.log(`   ❌ FAILED: Exceeds threshold of ${LOG_THRESHOLD} logs/min`);
        } else {
            console.log(`   ✅ PASSED: Below threshold of ${LOG_THRESHOLD} logs/min`);
        }
        
        // Heap stability analysis
        if (this.heapSamples.length > 1) {
            console.log('\n💾 HEAP STABILITY ANALYSIS:');
            const firstSample = this.heapSamples[0];
            const lastSample = this.heapSamples[this.heapSamples.length - 1];
            
            const heapChange = Math.abs(lastSample.used - firstSample.used);
            const percentChange = (heapChange / firstSample.used) * 100;
            
            console.log(`   Initial: ${firstSample.used}MB / ${firstSample.total}MB`);
            console.log(`   Final: ${lastSample.used}MB / ${lastSample.total}MB`);
            console.log(`   Change: ${heapChange}MB (${percentChange.toFixed(2)}%)`);
            
            if (percentChange > HEAP_VARIANCE_THRESHOLD * 100) {
                console.log(`   ❌ FAILED: Heap variance exceeds ${HEAP_VARIANCE_THRESHOLD * 100}%`);
            } else {
                console.log(`   ✅ PASSED: Heap stable within ${HEAP_VARIANCE_THRESHOLD * 100}%`);
            }
        }
        
        // Violations analysis
        console.log('\n🚨 VIOLATIONS:');
        if (this.violations.length === 0) {
            console.log('   ✅ No violations detected');
        } else {
            console.log(`   ❌ ${this.violations.length} violations found:`);
            
            // Group violations by type
            const violationsByType = {};
            this.violations.forEach(v => {
                if (!violationsByType[v.type]) {
                    violationsByType[v.type] = [];
                }
                violationsByType[v.type].push(v);
            });
            
            Object.entries(violationsByType).forEach(([type, violations]) => {
                console.log(`\n   ${type}: ${violations.length} occurrences`);
                violations.slice(0, 3).forEach(v => {
                    console.log(`      - ${v.message.substring(0, 80)}...`);
                });
                if (violations.length > 3) {
                    console.log(`      ... and ${violations.length - 3} more`);
                }
            });
        }
        
        // Overall result
        console.log('\n' + '='.repeat(60));
        const passed = 
            logsPerMinute <= LOG_THRESHOLD &&
            this.violations.length === 0 &&
            (this.heapSamples.length < 2 || 
             Math.abs(this.heapSamples[this.heapSamples.length - 1].used - this.heapSamples[0].used) / this.heapSamples[0].used <= HEAP_VARIANCE_THRESHOLD);
        
        if (passed) {
            console.log('✅ OBSERVATION MODE VALIDATION PASSED');
        } else {
            console.log('❌ OBSERVATION MODE VALIDATION FAILED');
        }
        console.log('='.repeat(60));
        
        return passed;
    }
    
    /**
     * Run the test
     */
    async run() {
        console.log('🧪 OBSERVATION MODE ENFORCEMENT VALIDATOR');
        console.log('='.repeat(60));
        console.log(`Test Duration: ${TEST_DURATION / 1000} seconds`);
        console.log(`Log Threshold: ${LOG_THRESHOLD} logs/minute`);
        console.log(`Heap Variance: ${HEAP_VARIANCE_THRESHOLD * 100}%`);
        console.log('='.repeat(60) + '\n');
        
        try {
            // Start syndicate
            await this.startSyndicate();
            
            console.log('⏱️ Running test...\n');
            
            // Run test for specified duration
            await new Promise(resolve => setTimeout(resolve, TEST_DURATION));
            
            // Stop syndicate
            console.log('\n🛑 Stopping syndicate...');
            if (this.syndicateProcess) {
                this.syndicateProcess.kill('SIGTERM');
                await new Promise(resolve => setTimeout(resolve, 5000));
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
    const validator = new ObservationModeValidator();
    validator.run().catch(console.error);
}

export default ObservationModeValidator;
