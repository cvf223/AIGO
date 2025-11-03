/**
 * 🔌 WEBSOCKET LOAD TEST PROCESSOR
 * ================================
 * 
 * Specialized processor for 10k concurrent WebSocket connections
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import os from 'os';

// Connection tracking
const connectionStats = {
    established: 0,
    failed: 0,
    active: 0,
    messagesReceived: 0,
    messagesSent: 0,
    bytesReceived: 0,
    bytesSent: 0,
    errors: 0,
    startTime: Date.now()
};

// Milestones for logging
const milestones = [100, 500, 1000, 2000, 5000, 7500, 10000];
let nextMilestone = 0;

/**
 * 🚀 SETUP - PREPARE FOR 10K CONNECTIONS
 */
export function setup(context, events, done) {
    console.log('🚀 Starting 10k WebSocket Connection Test');
    console.log('System Info:', {
        cpus: os.cpus().length,
        totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
        freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
        platform: os.platform(),
        nodeVersion: process.version
    });
    
    // Monitor system resources
    context.resourceMonitor = setInterval(() => {
        const usage = process.memoryUsage();
        const stats = {
            time: new Date().toISOString(),
            connections: connectionStats.active,
            memory: {
                rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(usage.external / 1024 / 1024)}MB`
            },
            cpu: process.cpuUsage()
        };
        
        if (connectionStats.active % 1000 === 0) {
            console.log('Resource usage:', stats);
        }
    }, 10000);
    
    return done();
}

/**
 * 🔌 ON CONNECT - TRACK CONNECTION
 */
export function onConnect(context, events, done) {
    connectionStats.established++;
    connectionStats.active++;
    
    // Log milestones
    if (nextMilestone < milestones.length && 
        connectionStats.active >= milestones[nextMilestone]) {
        const milestone = milestones[nextMilestone];
        const elapsed = (Date.now() - connectionStats.startTime) / 1000;
        console.log(`✅ Milestone reached: ${milestone} connections in ${elapsed}s`);
        console.log(`   Active: ${connectionStats.active}, Failed: ${connectionStats.failed}`);
        console.log(`   Success rate: ${((connectionStats.established / (connectionStats.established + connectionStats.failed)) * 100).toFixed(2)}%`);
        nextMilestone++;
    }
    
    // Store connection time
    context.vars.connectedAt = Date.now();
    context.vars.connectionId = `conn_${connectionStats.established}`;
    
    return done();
}

/**
 * ❌ ON ERROR - TRACK FAILURES
 */
export function onError(context, events, done) {
    connectionStats.failed++;
    connectionStats.errors++;
    
    // Log error details periodically
    if (connectionStats.errors % 100 === 0) {
        console.error(`⚠️ Error count: ${connectionStats.errors}`);
        console.error(`   Last error: ${context.vars.lastError}`);
    }
    
    return done();
}

/**
 * 📤 BEFORE SEND - TRACK OUTGOING
 */
export function beforeSend(message, context, callback) {
    connectionStats.messagesSent++;
    connectionStats.bytesSent += JSON.stringify(message).length;
    
    // Add metadata
    message.timestamp = Date.now();
    message.connectionId = context.vars.connectionId;
    
    callback(null, message);
}

/**
 * 📥 ON MESSAGE - TRACK INCOMING
 */
export function onMessage(message, context, callback) {
    connectionStats.messagesReceived++;
    connectionStats.bytesReceived += JSON.stringify(message).length;
    
    // Track message types
    const msgType = message.type || message.event;
    context.messageTypes = context.messageTypes || {};
    context.messageTypes[msgType] = (context.messageTypes[msgType] || 0) + 1;
    
    // Calculate latency for responses
    if (message.responseTime && context.vars.lastSentTime) {
        const latency = Date.now() - context.vars.lastSentTime;
        context.latencies = context.latencies || [];
        context.latencies.push(latency);
        
        // Log high latency
        if (latency > 1000) {
            console.warn(`High latency detected: ${latency}ms for ${msgType}`);
        }
    }
    
    callback();
}

/**
 * 🔌 ON DISCONNECT - UPDATE STATS
 */
export function onDisconnect(context, events, done) {
    connectionStats.active--;
    
    const connectionDuration = Date.now() - context.vars.connectedAt;
    console.log(`Connection ${context.vars.connectionId} closed after ${connectionDuration}ms`);
    
    // Log stats for this connection
    if (context.messageTypes) {
        console.log(`Messages received:`, context.messageTypes);
    }
    
    if (context.latencies && context.latencies.length > 0) {
        const avgLatency = context.latencies.reduce((a, b) => a + b, 0) / context.latencies.length;
        console.log(`Average latency: ${avgLatency.toFixed(2)}ms`);
    }
    
    return done();
}

/**
 * 📊 PERIODIC STATS REPORT
 */
export function reportStats(context, events, done) {
    const elapsed = (Date.now() - connectionStats.startTime) / 1000;
    const stats = {
        elapsed: `${elapsed}s`,
        connections: {
            active: connectionStats.active,
            total: connectionStats.established,
            failed: connectionStats.failed,
            successRate: `${((connectionStats.established / (connectionStats.established + connectionStats.failed)) * 100).toFixed(2)}%`
        },
        messages: {
            sent: connectionStats.messagesSent,
            received: connectionStats.messagesReceived,
            msgPerSec: (connectionStats.messagesReceived / elapsed).toFixed(2)
        },
        bandwidth: {
            sent: `${(connectionStats.bytesSent / 1024 / 1024).toFixed(2)}MB`,
            received: `${(connectionStats.bytesReceived / 1024 / 1024).toFixed(2)}MB`
        },
        errors: connectionStats.errors
    };
    
    console.log('📊 Current Stats:', JSON.stringify(stats, null, 2));
    
    // Write to file for monitoring
    const fs = require('fs');
    fs.writeFileSync(
        './reports/current-stats.json',
        JSON.stringify({
            timestamp: new Date().toISOString(),
            ...stats
        }, null, 2)
    );
    
    return done();
}

/**
 * 🏁 CLEANUP - FINAL REPORT
 */
export function cleanup(context, events, done) {
    // Clear monitors
    if (context.resourceMonitor) {
        clearInterval(context.resourceMonitor);
    }
    
    const totalDuration = (Date.now() - connectionStats.startTime) / 1000;
    
    console.log('');
    console.log('='.repeat(60));
    console.log('🏁 10K WEBSOCKET TEST COMPLETED');
    console.log('='.repeat(60));
    console.log('');
    console.log('📊 FINAL RESULTS:');
    console.log(`   Duration: ${totalDuration}s`);
    console.log(`   Peak Connections: ${connectionStats.established}`);
    console.log(`   Failed Connections: ${connectionStats.failed}`);
    console.log(`   Success Rate: ${((connectionStats.established / (connectionStats.established + connectionStats.failed)) * 100).toFixed(2)}%`);
    console.log('');
    console.log('📨 MESSAGE STATS:');
    console.log(`   Total Sent: ${connectionStats.messagesSent}`);
    console.log(`   Total Received: ${connectionStats.messagesReceived}`);
    console.log(`   Messages/sec: ${(connectionStats.messagesReceived / totalDuration).toFixed(2)}`);
    console.log('');
    console.log('📡 BANDWIDTH:');
    console.log(`   Sent: ${(connectionStats.bytesSent / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Received: ${(connectionStats.bytesReceived / 1024 / 1024).toFixed(2)}MB`);
    console.log('');
    console.log('❌ ERRORS: ' + connectionStats.errors);
    console.log('');
    console.log('='.repeat(60));
    
    // Save final report
    const fs = require('fs');
    const finalReport = {
        testName: '10K WebSocket Connection Test',
        timestamp: new Date().toISOString(),
        duration: totalDuration,
        results: {
            connections: {
                peak: connectionStats.established,
                failed: connectionStats.failed,
                successRate: ((connectionStats.established / (connectionStats.established + connectionStats.failed)) * 100).toFixed(2)
            },
            messages: {
                sent: connectionStats.messagesSent,
                received: connectionStats.messagesReceived,
                perSecond: (connectionStats.messagesReceived / totalDuration).toFixed(2)
            },
            bandwidth: {
                sentMB: (connectionStats.bytesSent / 1024 / 1024).toFixed(2),
                receivedMB: (connectionStats.bytesReceived / 1024 / 1024).toFixed(2)
            },
            errors: connectionStats.errors
        },
        passed: connectionStats.established >= 9800 && // 98% of 10k
                connectionStats.errors < connectionStats.established * 0.02 // < 2% errors
    };
    
    fs.writeFileSync(
        './reports/10k-final-report.json',
        JSON.stringify(finalReport, null, 2)
    );
    
    if (finalReport.passed) {
        console.log('✅ TEST PASSED - Successfully handled 10k connections!');
    } else {
        console.log('❌ TEST FAILED - Did not meet performance criteria');
    }
    
    return done();
}

// Export all hooks
export default {
    setup,
    onConnect,
    onError,
    beforeSend,
    onMessage,
    onDisconnect,
    reportStats,
    cleanup
};
