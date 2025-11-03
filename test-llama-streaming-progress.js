#!/usr/bin/env node

/**
 * 🧠 LLAMA3.3 STREAMING PROGRESS TEST - 10 MINUTE TIMEOUT
 * ======================================================
 * Tests llama3.3:70b with streaming progress bar for long responses
 * German HOAI Architecture Analysis with real-time progress visualization
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_PROMPT = "was ist besonders and deutscher architektur nach der HOAI ??!";
const MODEL_NAME = "llama3.3:70b";
const TOTAL_TIMEOUT = 600000; // 10 minutes
const PROGRESS_THRESHOLD = 60000; // 1 minute - start showing progress bar

class StreamingProgressTester {
    constructor() {
        this.startTime = Date.now();
        this.responseData = '';
        this.progressShown = false;
        this.progressInterval = null;
        this.charCount = 0;
        this.wordCount = 0;
        this.isComplete = false;
    }
    
    /**
     * Initialize and run the streaming test
     */
    async runStreamingTest() {
        console.log('🧠 LLAMA3.3 STREAMING PROGRESS TEST');
        console.log('='.repeat(60));
        console.log(`📋 Model: ${MODEL_NAME} (42.5GB Large Language Model)`);
        console.log(`📋 Prompt: "${TEST_PROMPT}"`);
        console.log(`⏱️ Timeout: ${TOTAL_TIMEOUT/1000/60} minutes`);
        console.log(`📊 Progress Bar: Starts after ${PROGRESS_THRESHOLD/1000}s`);
        console.log('='.repeat(60));
        console.log('');
        
        return new Promise((resolve, reject) => {
            // Set overall timeout
            const overallTimeout = setTimeout(() => {
                this.cleanup();
                console.log('\n❌ OVERALL TIMEOUT (10 minutes exceeded)');
                reject(new Error('Overall timeout'));
            }, TOTAL_TIMEOUT);
            
            // Spawn ollama process with streaming
            console.log('🚀 Starting ollama process...');
            const ollamaProcess = spawn('ollama', ['run', MODEL_NAME], {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            // Send the prompt
            ollamaProcess.stdin.write(TEST_PROMPT + '\n');
            ollamaProcess.stdin.end();
            
            // Handle stdout (streaming response)
            ollamaProcess.stdout.on('data', (data) => {
                const chunk = data.toString();
                this.handleResponseChunk(chunk);
            });
            
            // Handle stderr (model loading messages)
            ollamaProcess.stderr.on('data', (data) => {
                const errorMsg = data.toString();
                console.log(`🔄 Loading: ${errorMsg.trim()}`);
            });
            
            // Handle process completion
            ollamaProcess.on('close', (code) => {
                clearTimeout(overallTimeout);
                this.cleanup();
                
                if (code === 0) {
                    console.log('\n✅ STREAMING TEST COMPLETED SUCCESSFULLY');
                    this.generateFinalReport();
                    resolve(this.responseData);
                } else {
                    console.log(`\n❌ Process exited with code: ${code}`);
                    reject(new Error(`Process failed with code ${code}`));
                }
            });
            
            // Handle process errors
            ollamaProcess.on('error', (error) => {
                clearTimeout(overallTimeout);
                this.cleanup();
                console.log(`\n💥 Process error: ${error.message}`);
                reject(error);
            });
            
            // Start monitoring for progress bar trigger
            this.startProgressMonitoring();
        });
    }
    
    /**
     * Handle incoming response chunks
     */
    handleResponseChunk(chunk) {
        // Filter out ANSI escape sequences and control characters
        const cleanChunk = chunk.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        if (cleanChunk.trim().length > 0) {
            this.responseData += cleanChunk;
            this.charCount = this.responseData.length;
            this.wordCount = this.responseData.split(/\s+/).filter(word => word.length > 0).length;
            
            // Update progress if shown
            if (this.progressShown) {
                this.updateProgressDisplay();
            } else {
                // Show first characters as they arrive
                process.stdout.write(cleanChunk);
            }
        }
    }
    
    /**
     * Start monitoring for progress bar activation
     */
    startProgressMonitoring() {
        setTimeout(() => {
            if (!this.isComplete && !this.progressShown) {
                console.log('\n');
                console.log('⏱️ Response taking longer than 1 minute...');
                console.log('📊 Switching to progress bar mode');
                console.log('='.repeat(60));
                this.startProgressBar();
            }
        }, PROGRESS_THRESHOLD);
    }
    
    /**
     * Start the progress bar display
     */
    startProgressBar() {
        this.progressShown = true;
        
        this.progressInterval = setInterval(() => {
            if (!this.isComplete) {
                this.updateProgressDisplay();
            }
        }, 2000); // Update every 2 seconds
        
        // Initial display
        this.updateProgressDisplay();
    }
    
    /**
     * Update the progress display
     */
    updateProgressDisplay() {
        const elapsed = Math.round((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        // Create progress bar based on response length
        const expectedLength = 2000; // Expected response length
        const progress = Math.min(this.charCount / expectedLength, 1);
        const barWidth = 40;
        const filledWidth = Math.round(progress * barWidth);
        const emptyWidth = barWidth - filledWidth;
        
        const progressBar = '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);
        const percentage = Math.round(progress * 100);
        
        // Clear line and show progress
        process.stdout.write('\r\x1b[K');
        process.stdout.write(
            `🧠 [${progressBar}] ${percentage}% | ` +
            `📝 ${this.charCount} chars | ` +
            `📊 ${this.wordCount} words | ` +
            `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')}`
        );
        
        // Show preview of latest content every 10 seconds
        if (elapsed % 10 === 0 && this.responseData.length > 0) {
            const latestPreview = this.responseData.slice(-100).replace(/\n/g, ' ').trim();
            console.log(`\n📋 Latest: "...${latestPreview}"`);
        }
    }
    
    /**
     * Clean up intervals and timers
     */
    cleanup() {
        this.isComplete = true;
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    /**
     * Generate final comprehensive report
     */
    generateFinalReport() {
        const totalTime = Date.now() - this.startTime;
        const minutes = Math.floor(totalTime / 1000 / 60);
        const seconds = Math.round((totalTime % 60000) / 1000);
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 LLAMA3.3 STREAMING TEST FINAL REPORT');
        console.log('='.repeat(80));
        
        console.log(`⏱️ Total Duration: ${minutes}m ${seconds}s`);
        console.log(`📝 Response Length: ${this.charCount} characters`);
        console.log(`📊 Word Count: ${this.wordCount} words`);
        console.log(`🧠 Model: ${MODEL_NAME} (42.5GB)`);
        console.log(`📋 Prompt: "${TEST_PROMPT}"`);
        
        // Performance metrics
        const charsPerSecond = Math.round(this.charCount / (totalTime / 1000));
        const wordsPerMinute = Math.round(this.wordCount / (totalTime / 1000 / 60));
        
        console.log('\n📈 PERFORMANCE METRICS:');
        console.log(`   Characters/second: ${charsPerSecond}`);
        console.log(`   Words/minute: ${wordsPerMinute}`);
        
        // Content analysis
        if (this.responseData) {
            const response = this.responseData.toLowerCase();
            const hoaiMentions = (response.match(/hoai/g) || []).length;
            const architectureMentions = (response.match(/architektur/g) || []).length;
            const germanMentions = (response.match(/deutsch/g) || []).length;
            const sentences = this.responseData.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
            
            console.log('\n🎯 CONTENT ANALYSIS:');
            console.log(`   HOAI mentions: ${hoaiMentions}`);
            console.log(`   Architecture references: ${architectureMentions}`);
            console.log(`   German context: ${germanMentions}`);
            console.log(`   Sentences: ${sentences}`);
        }
        
        // Quality assessment
        console.log('\n🏆 QUALITY ASSESSMENT:');
        if (this.charCount > 1000) {
            console.log('   ✅ Response Length: Comprehensive');
        } else if (this.charCount > 500) {
            console.log('   ⚠️ Response Length: Moderate');
        } else {
            console.log('   ❌ Response Length: Brief');
        }
        
        if (totalTime < 120000) { // 2 minutes
            console.log('   ✅ Response Speed: Fast');
        } else if (totalTime < 300000) { // 5 minutes
            console.log('   ⚠️ Response Speed: Moderate');
        } else {
            console.log('   ❌ Response Speed: Slow');
        }
        
        // Show response preview
        console.log('\n📋 RESPONSE PREVIEW (first 500 characters):');
        console.log('-'.repeat(60));
        if (this.responseData.length > 0) {
            const preview = this.responseData.substring(0, 500);
            console.log(preview + (this.responseData.length > 500 ? '...' : ''));
        } else {
            console.log('No response received');
        }
        
        console.log('='.repeat(80));
        
        // Final verdict
        if (this.charCount > 1000 && totalTime < 600000) {
            console.log('🎉 SUCCESS: llama3.3:70b delivers comprehensive German HOAI analysis!');
            console.log('✅ RECOMMENDATION: Use for production German construction reasoning');
        } else if (this.charCount > 500) {
            console.log('⚠️ PARTIAL SUCCESS: Reasonable response but performance concerns');
        } else {
            console.log('❌ NEEDS IMPROVEMENT: Consider optimizations or alternative approach');
        }
        
        console.log('='.repeat(80));
    }
}

/**
 * Run the streaming test
 */
async function runTest() {
    const tester = new StreamingProgressTester();
    
    try {
        console.log('🔥 Initializing llama3.3 streaming test with 10-minute timeout...');
        console.log('📊 Progress bar will activate after 1 minute if needed');
        console.log('');
        
        await tester.runStreamingTest();
        
        console.log('\n🎯 Test completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Streaming test failed:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTest().catch(console.error);
}

export default StreamingProgressTester;
