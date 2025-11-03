#!/usr/bin/env node

/**
 * 🏗️ GUI HEALTH VERIFICATION SCRIPT
 * ==================================
 * 
 * Quick verification that all GUI components and backend endpoints are working
 */

import fetch from 'node-fetch';

const API_URL = 'http://162.55.83.33:3001';
const TESTS = [];

function test(name, fn) {
    TESTS.push({ name, fn });
}

async function runTests() {
    console.log('\n🏗️ CONSTRUCTION SYNDICATE GUI - HEALTH VERIFICATION');
    console.log('=====================================================\n');
    
    let passed = 0;
    let failed = 0;
    
    for (const { name, fn } of TESTS) {
        try {
            await fn();
            console.log(`✅ ${name}`);
            passed++;
        } catch (error) {
            console.log(`❌ ${name}`);
            console.log(`   Error: ${error.message}`);
            failed++;
        }
    }
    
    console.log('\n=====================================================');
    console.log(`📊 Results: ${passed} passed, ${failed} failed`);
    console.log('=====================================================\n');
    
    if (failed === 0) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL!\n');
        process.exit(0);
    } else {
        console.log('⚠️  Some systems need attention\n');
        process.exit(1);
    }
}

// Define tests
test('Backend server is running', async () => {
    const res = await fetch(`${API_URL}/health`, { timeout: 5000 });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error('Server not healthy');
});

test('Database connection is active', async () => {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    if (!data.database || data.database.status !== 'connected') {
        throw new Error('Database not connected');
    }
});

test('LLM models endpoint returns data', async () => {
    const res = await fetch(`${API_URL}/api/llm/models`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.models) throw new Error('No models returned');
    if (Object.keys(data.models).length === 0) throw new Error('Models list is empty');
});

test('Agents endpoint is accessible', async () => {
    const res = await fetch(`${API_URL}/api/agents`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Request failed');
});

test('Dashboard stats endpoint works', async () => {
    const res = await fetch(`${API_URL}/api/dashboard/stats`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.stats) throw new Error('No stats returned');
});

test('Dashboard activity endpoint works', async () => {
    const res = await fetch(`${API_URL}/api/dashboard/activity`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.activities)) {
        throw new Error('Invalid activity data');
    }
});

test('Systems list endpoint returns data', async () => {
    const res = await fetch(`${API_URL}/api/systems`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.systems)) {
        throw new Error('Invalid systems data');
    }
});

test('Notifications endpoint is accessible', async () => {
    const res = await fetch(`${API_URL}/api/humanloop/notifications`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Request failed');
});

test('Mailbox endpoint is accessible', async () => {
    const res = await fetch(`${API_URL}/api/humanloop/mailbox`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error('Request failed');
});

test('WebSocket server is listening', async () => {
    // Test that the server accepts WebSocket upgrade
    const res = await fetch(`${API_URL}/socket.io/`, {
        headers: { 'Connection': 'Upgrade', 'Upgrade': 'websocket' }
    });
    // Socket.IO should respond even if upgrade fails
    if (res.status >= 500) throw new Error('WebSocket server not responding');
});

// Run all tests
runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
});

