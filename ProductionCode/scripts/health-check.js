#!/usr/bin/env node
/**
 * 🏥 SYSTEM HEALTH CHECK
 * ======================
 * 
 * Validates all critical systems are operational
 */

import dbConnectionManager from '../src/database/DatabaseConnectionManager.js';
import { Ollama } from 'ollama';
import fetch from 'node-fetch';

async function healthCheck() {
    console.log('🏥 Construction Syndicate Health Check');
    console.log('=====================================');
    
    const results = {
        database: false,
        ollama: false,
        models: [],
        webGUI: false,
        errors: []
    };
    
    // Check database
    try {
        const healthy = await dbConnectionManager.isHealthy();
        results.database = healthy;
        console.log(healthy ? '✅ Database: Connected' : '❌ Database: Not connected');
    } catch (error) {
        results.errors.push(`Database: ${error.message}`);
        console.log('❌ Database: Error');
    }
    
    // Check Ollama
    try {
        const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://localhost:11434' });
        const models = await ollama.list();
        results.ollama = true;
        results.models = models.models.map(m => m.name);
        console.log(`✅ Ollama: Connected (${results.models.length} models)`);
        
        // Expected models
        const expected = ['qwen2.5:72b-instruct-fp16', 'llava:34b', 'phi3:14b', 'llama3.3:70b', 'mistral:7b-instruct-fp16'];
        for (const model of expected) {
            if (results.models.includes(model)) {
                console.log(`   ✅ ${model}`);
            } else {
                console.log(`   ❌ ${model} (missing)`);
            }
        }
    } catch (error) {
        results.errors.push(`Ollama: ${error.message}`);
        console.log('❌ Ollama: Not accessible');
    }
    
    // Check Web GUI
    try {
        const response = await fetch('http://localhost:3001/health');
        results.webGUI = response.ok;
        console.log(response.ok ? '✅ Web GUI: Running' : '❌ Web GUI: Not responding');
    } catch (error) {
        results.errors.push(`Web GUI: ${error.message}`);
        console.log('❌ Web GUI: Not accessible');
    }
    
    console.log('');
    console.log('📊 OVERALL HEALTH:');
    
    const healthy = results.database && results.ollama && results.models.length >= 5;
    
    if (healthy) {
        console.log('✅ System is HEALTHY');
        process.exit(0);
    } else {
        console.log('❌ System has issues - check errors above');
        process.exit(1);
    }
}

healthCheck();

