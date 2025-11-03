/**
 * 🚀 LOAD TEST PROCESSOR
 * ======================
 * 
 * Custom functions for Artillery load testing
 * Handles WebSocket authentication and test data generation
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test data cache
const testDataCache = {
    tokens: new Map(),
    planFiles: [],
    userCounter: 0
};

/**
 * 🔌 CONNECT WITH AUTHENTICATION
 */
export function connectWithAuth(context, events, done) {
    const token = context.vars.token;
    
    if (token) {
        // Add token to WebSocket connection query
        context.ws = {
            ...context.ws,
            query: {
                token: token
            }
        };
    }
    
    return done();
}

/**
 * 📁 GENERATE TEST PLAN FILE
 */
export async function generateTestPlan(context, events, done) {
    try {
        // Create a simple test plan image
        const planContent = Buffer.from(`
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="600" fill="white"/>
                <text x="400" y="50" text-anchor="middle" font-size="20">
                    Load Test Plan ${Date.now()}
                </text>
                <rect x="100" y="100" width="200" height="150" 
                      fill="none" stroke="black" stroke-width="2"/>
                <rect x="400" y="100" width="200" height="150" 
                      fill="none" stroke="black" stroke-width="2"/>
                <text x="200" y="180" text-anchor="middle">Room A</text>
                <text x="500" y="180" text-anchor="middle">Room B</text>
                <line x1="100" y1="300" x2="600" y2="300" 
                      stroke="black" stroke-width="1" stroke-dasharray="5,5"/>
                <text x="100" y="330" font-size="12">
                    Generated: ${new Date().toISOString()}
                </text>
            </svg>
        `);
        
        // Convert to base64 for form upload
        context.vars.testPlanBase64 = planContent.toString('base64');
        context.vars.testPlanSize = planContent.length;
        
    } catch (error) {
        console.error('Failed to generate test plan:', error);
    }
    
    return done();
}

/**
 * 👤 GENERATE UNIQUE USER
 */
export function generateUniqueUser(context, events, done) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    
    context.vars.uniqueUser = {
        username: `loadtest_${timestamp}_${random}`,
        email: `loadtest_${timestamp}_${random}@test.com`,
        password: 'LoadTest123!'
    };
    
    return done();
}

/**
 * 📊 BEFORE REQUEST HOOK
 */
export function beforeRequest(requestParams, context, events, done) {
    // Add custom headers
    requestParams.headers = {
        ...requestParams.headers,
        'X-Load-Test': 'true',
        'X-Test-ID': context.vars.$uuid || crypto.randomUUID()
    };
    
    // Log high-level metrics
    if (context.vars.$loopCount && context.vars.$loopCount % 100 === 0) {
        console.log(`Progress: ${context.vars.$loopCount} iterations completed`);
    }
    
    return done();
}

/**
 * 📈 AFTER RESPONSE HOOK
 */
export function afterResponse(requestParams, response, context, events, done) {
    // Track response times
    if (response.timings) {
        const totalTime = response.timings.phases.total;
        
        // Log slow requests
        if (totalTime > 1000) {
            console.warn(`Slow request detected: ${requestParams.url} took ${totalTime}ms`);
        }
    }
    
    // Track errors
    if (response.statusCode >= 400) {
        console.error(`Error response: ${response.statusCode} from ${requestParams.url}`);
    }
    
    return done();
}

/**
 * 🎲 GENERATE RANDOM CHAT MESSAGE
 */
export function generateChatMessage(context, events, done) {
    const messages = [
        "What is the current status of the construction plan analysis?",
        "Can you explain the HOAI LP 6 compliance requirements?",
        "Show me the quantity takeoffs for the latest floor plan",
        "What are the detected errors in the structural elements?",
        "Generate a cost estimation based on DIN 276",
        "Explain the reasoning behind the material recommendations",
        "What is the confidence level for the wall detection?",
        "Show me the compliance check results",
        "Can you analyze the room dimensions?",
        "What optimization opportunities were identified?"
    ];
    
    context.vars.chatMessage = messages[Math.floor(Math.random() * messages.length)];
    context.vars.messageId = crypto.randomUUID();
    
    return done();
}

/**
 * 🔄 WEBSOCKET MESSAGE HANDLER
 */
export function handleWebSocketMessage(message, context, callback) {
    const msgType = message.type || message.event;
    
    // Track different message types
    context.stats = context.stats || {
        systemUpdates: 0,
        chatResponses: 0,
        notifications: 0,
        errors: 0
    };
    
    switch (msgType) {
        case 'systemUpdate':
            context.stats.systemUpdates++;
            break;
        case 'chat:response':
            context.stats.chatResponses++;
            break;
        case 'chat:streaming':
            // Track streaming chunks
            break;
        case 'notificationNew':
            context.stats.notifications++;
            break;
        case 'error':
        case 'chatError':
            context.stats.errors++;
            console.error('WebSocket error:', message);
            break;
    }
    
    // Log stats periodically
    const totalMessages = Object.values(context.stats).reduce((a, b) => a + b, 0);
    if (totalMessages % 100 === 0) {
        console.log('WebSocket stats:', context.stats);
    }
    
    callback();
}

/**
 * 🏁 SETUP FUNCTION
 */
export function setup(context, events, done) {
    console.log('🚀 Starting load test for Elite Construction AI Syndicate');
    console.log(`Target: ${context.vars.target}`);
    console.log(`Phases: ${context.phases.length}`);
    console.log(`Scenarios: ${context.scenarios.length}`);
    
    // Initialize test data
    initializeTestData();
    
    return done();
}

/**
 * 🏁 CLEANUP FUNCTION
 */
export function cleanup(context, events, done) {
    console.log('✅ Load test completed');
    console.log('Final stats:', {
        totalVirtualUsers: context.stats?.totalVirtualUsers || 0,
        totalRequests: context.stats?.totalRequests || 0,
        totalErrors: context.stats?.totalErrors || 0
    });
    
    return done();
}

/**
 * 📊 INITIALIZE TEST DATA
 */
async function initializeTestData() {
    try {
        // Create test plan files
        const testPlansDir = path.join(__dirname, 'test-plans');
        await fs.mkdir(testPlansDir, { recursive: true });
        
        // Generate a few test plan files
        for (let i = 0; i < 5; i++) {
            const planPath = path.join(testPlansDir, `test-plan-${i}.svg`);
            const planContent = generateSVGPlan(i);
            await fs.writeFile(planPath, planContent);
            testDataCache.planFiles.push(planPath);
        }
        
        console.log(`✅ Created ${testDataCache.planFiles.length} test plan files`);
        
    } catch (error) {
        console.error('Failed to initialize test data:', error);
    }
}

/**
 * 🎨 GENERATE SVG PLAN
 */
function generateSVGPlan(index) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="800" fill="#f0f0f0"/>
    <text x="600" y="50" text-anchor="middle" font-size="24" font-weight="bold">
        Test Construction Plan ${index + 1}
    </text>
    
    <!-- Grid -->
    ${Array.from({ length: 12 }, (_, i) => `
        <line x1="${i * 100}" y1="100" x2="${i * 100}" y2="700" 
              stroke="#cccccc" stroke-width="1"/>
    `).join('')}
    ${Array.from({ length: 6 }, (_, i) => `
        <line x1="0" y1="${100 + i * 100}" x2="1200" y2="${100 + i * 100}" 
              stroke="#cccccc" stroke-width="1"/>
    `).join('')}
    
    <!-- Rooms -->
    <rect x="100" y="150" width="400" height="300" 
          fill="none" stroke="black" stroke-width="2"/>
    <text x="300" y="300" text-anchor="middle" font-size="16">
        Room A - ${40 + index * 5}m²
    </text>
    
    <rect x="500" y="150" width="300" height="300" 
          fill="none" stroke="black" stroke-width="2"/>
    <text x="650" y="300" text-anchor="middle" font-size="16">
        Room B - ${30 + index * 3}m²
    </text>
    
    <rect x="800" y="150" width="300" height="200" 
          fill="none" stroke="black" stroke-width="2"/>
    <text x="950" y="250" text-anchor="middle" font-size="16">
        Room C - ${25 + index * 2}m²
    </text>
    
    <!-- Dimensions -->
    <line x1="100" y1="500" x2="500" y2="500" 
          stroke="red" stroke-width="1" marker-end="url(#arrowhead)"/>
    <text x="300" y="520" text-anchor="middle" font-size="12" fill="red">
        4.00m
    </text>
    
    <!-- Legend -->
    <text x="50" y="750" font-size="12">
        Scale: 1:100 | Date: ${new Date().toLocaleDateString()} | Plan Type: Floor Plan
    </text>
    
    <!-- Arrow marker -->
    <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="red"/>
        </marker>
    </defs>
</svg>`;
}

// Export all functions
export default {
    connectWithAuth,
    generateTestPlan,
    generateUniqueUser,
    beforeRequest,
    afterResponse,
    generateChatMessage,
    handleWebSocketMessage,
    setup,
    cleanup
};
