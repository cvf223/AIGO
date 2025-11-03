#!/usr/bin/env node

/**
 * 🔌 WEBSOCKET CONNECTION TESTER
 * ==============================
 * 
 * Tests WebSocket connection to Construction GUI Server
 * Usage: node test-websocket-connection.js [url]
 */

import { io } from 'socket.io-client';

const WS_URL = process.argv[2] || 'http://162.55.83.33:3001';

console.log(`\n🔌 TESTING WEBSOCKET CONNECTION`);
console.log(`======================================`);
console.log(`Target: ${WS_URL}\n`);

const socket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    reconnection: false,
    timeout: 10000,
    forceNew: true
});

let connected = false;

socket.on('connect', () => {
    connected = true;
    console.log('✅ CONNECTED SUCCESSFULLY!');
    console.log(`   Socket ID: ${socket.id}`);
    console.log(`   Transport: ${socket.io.engine.transport.name}`);
    console.log('');
    
    // Test ping
    console.log('📡 Testing ping...');
    socket.emit('ping');
});

socket.on('connected', (data) => {
    console.log('✅ Server confirmation received:');
    console.log(`   Client ID: ${data.clientId}`);
    console.log(`   Server Time: ${new Date(data.serverTime).toLocaleString()}`);
    console.log(`   Server Version: ${data.serverVersion || 'N/A'}`);
    console.log(`   Available Systems: ${data.availableSystems?.length || 0}`);
    console.log('');
});

socket.on('pong', (data) => {
    console.log('✅ Pong received:');
    console.log(`   Server Time: ${new Date(data.serverTime).toLocaleString()}`);
    console.log('');
    
    // Success - disconnect and exit
    setTimeout(() => {
        console.log('🎉 WEBSOCKET CONNECTION TEST: PASSED\n');
        socket.disconnect();
        process.exit(0);
    }, 1000);
});

socket.on('heartbeat', (data) => {
    console.log('💓 Heartbeat received');
});

socket.on('connect_error', (error) => {
    console.error('❌ CONNECTION FAILED!');
    console.error(`   Error: ${error.message}`);
    console.error(`   Type: ${error.type}`);
    console.error(`   Description: ${error.description || 'N/A'}`);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   1. Check backend is running: ps aux | grep construction-gui-server');
    console.error('   2. Check port 3001: lsof -i:3001');
    console.error('   3. Check backend logs: PM2_HOME=~/.pm2 pm2 logs construction-backend');
    console.error('   4. Test health endpoint: curl http://162.55.83.33:3001/health');
    console.error('');
    process.exit(1);
});

socket.on('connect_timeout', () => {
    console.error('❌ CONNECTION TIMEOUT (10 seconds)');
    console.error('');
    console.error('Backend may be starting up. Wait and try again.');
    console.error('');
    process.exit(1);
});

// Overall timeout
setTimeout(() => {
    if (!connected) {
        console.error('❌ TEST TIMEOUT - No connection after 10 seconds');
        console.error('');
        console.error('Check if backend is running and accessible.');
        console.error('');
        process.exit(1);
    }
}, 10000);

