#!/usr/bin/env node

/**
 * 🌐 ELITE SYNDICATE WEB GUI BACKEND
 * ==================================
 * 
 * WebSocket backend that streams live syndicate data to the React frontend
 * Connects to the running syndicate and provides real-time updates
 */

import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🚀 SYNDICATE DATA STREAMING SERVER
 */
class SyndicateWebGUIBackend {
    constructor() {
        this.port = process.env.WEBSOCKET_PORT || 3001;
        this.clients = new Set();
        this.syndicateData = {
            agents: new Map(),
            opportunities: [],
            systemMetrics: {
                totalAgents: 0,
                totalOpportunities: 0,
                totalLearningEvents: 0,
                systemUptime: 0,
                avgCostSavingsPerDay: 0
            },
            recentActivity: []
        };
        
        // Mock data generation for testing
        this.mockDataInterval = null;
        
        console.log('🌐 Initializing Elite Syndicate Web GUI Backend...');
    }
    
    /**
     * 🚀 START THE WEBSOCKET SERVER
     */
    async start() {
        try {
            // Create Express app for health checks
            const app = express();
            app.use(cors());
            app.use(express.json());
            
            // Health check endpoint
            app.get('/health', (req, res) => {
                res.json({
                    status: 'healthy',
                    clients: this.clients.size,
                    uptime: process.uptime(),
                    timestamp: Date.now()
                });
            });
            
            // Create HTTP server
            const server = createServer(app);
            
            // Create WebSocket server
            this.wss = new WebSocketServer({ 
                server,
                path: '/syndicate-stream'
            });
            
            // Handle WebSocket connections
            this.wss.on('connection', (ws, req) => {
                console.log(`🔗 New client connected from ${req.socket.remoteAddress}`);
                this.clients.add(ws);
                
                // Send current syndicate state immediately
                this.sendToClient(ws, {
                    type: 'initial_state',
                    data: {
                        agents: Array.from(this.syndicateData.agents.entries()),
                        systemMetrics: this.syndicateData.systemMetrics,
                        recentActivity: this.syndicateData.recentActivity.slice(-50)
                    }
                });
                
                // Handle client messages
                ws.on('message', (message) => {
                    try {
                        const data = JSON.parse(message.toString());
                        this.handleClientMessage(ws, data);
                    } catch (error) {
                        console.error('❌ Invalid message from client:', error.message);
                    }
                });
                
                // Handle client disconnect
                ws.on('close', () => {
                    this.clients.delete(ws);
                    console.log(`🔌 Client disconnected (${this.clients.size} remaining)`);
                });
                
                // Handle errors
                ws.on('error', (error) => {
                    console.error('❌ WebSocket error:', error.message);
                    this.clients.delete(ws);
                });
            });
            
            // Start the server
            server.listen(this.port, () => {
                console.log(`🚀 Syndicate Web GUI Backend running on port ${this.port}`);
                console.log(`🌐 WebSocket endpoint: ws://localhost:${this.port}/syndicate-stream`);
                console.log(`🏥 Health check: http://localhost:${this.port}/health`);
            });
            
            // Start mock data generation for testing
            this.startMockDataGeneration();
            
            // Try to connect to running syndicate
            this.attemptSyndicateConnection();
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to start Web GUI Backend:', error);
            throw error;
        }
    }
    
    /**
     * 🔄 ATTEMPT TO CONNECT TO RUNNING SYNDICATE
     */
    async attemptSyndicateConnection() {
        console.log('🔍 Attempting to connect to running syndicate...');
        
        // In a real implementation, this would connect to the syndicate's IPC or shared memory
        // For now, we'll simulate the connection and generate realistic data
        
        setTimeout(() => {
            console.log('✅ Connected to syndicate simulation');
            this.generateInitialAgentData();
        }, 2000);
    }
    
    /**
     * 🤖 GENERATE INITIAL AGENT DATA
     */
    generateInitialAgentData() {
        const agentTypes = [
            'head-architect-orchestrator',
            'quantity-surveyor-specialist', 
            'compliance-verification-analyst',
            'error-detection-auditor',
            'tender-document-generator',
            'bid-evaluation-judge',
            'cost-estimation-expert'
        ];
        
        agentTypes.forEach((agentId, index) => {
            this.syndicateData.agents.set(agentId, {
                id: agentId,
                name: agentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                type: agentId.includes('specialist') ? 'Specialist' : 'Analyst',
                status: 'active',
                backgroundTasks: [
                    'Construction Compliance Monitoring',
                    'Opportunity Detection',
                    'Learning & Evolution'
                ],
                performance: {
                    successRate: 0.75 + Math.random() * 0.2,
                    totalExecutions: Math.floor(Math.random() * 150),
                    totalCostSavingsEUR: Math.floor(Math.random() * 50000),
                    avgExecutionTime: 1200 + Math.random() * 800
                },
                currentActivity: this.generateRandomActivity(),
                lastActive: Date.now()
            });
        });
        
        this.syndicateData.systemMetrics.totalAgents = this.syndicateData.agents.size;
        
        // Broadcast initial data
        this.broadcastUpdate({
            type: 'agents_initialized', 
            data: Array.from(this.syndicateData.agents.entries())
        });
    }
    
    /**
     * 🎲 GENERATE RANDOM ACTIVITY
     */
    generateRandomActivity() {
        const activities = [
            'Analyzing Construction Plans',
            'Analyzing HOAI compliance gaps', 
            'Executing quantity takeoffs',
            'Learning from construction project data',
            'Coordinating with team',
            'Optimizing resource allocation',
            'Scanning for efficiency opportunities',
            'Updating construction knowledge model'
        ];
        
        return activities[Math.floor(Math.random() * activities.length)];
    }
    
    /**
     * 📊 START MOCK DATA GENERATION
     */
    startMockDataGeneration() {
        console.log('📊 Starting mock data generation for testing...');
        
        this.mockDataInterval = setInterval(() => {
            this.generateMockActivity();
        }, 3000); // Update every 3 seconds
    }
    
    /**
     * 🎯 GENERATE MOCK ACTIVITY
     */
    generateMockActivity() {
        // Update agent activities
        this.syndicateData.agents.forEach((agent, agentId) => {
            // Random chance to update activity
            if (Math.random() > 0.7) {
                agent.currentActivity = this.generateRandomActivity();
                agent.lastActive = Date.now();
                
                // Random chance to simulate an opportunity
                if (Math.random() > 0.85) {
                    this.simulateOpportunityDetection(agentId);
                }
                
                // Random chance to simulate learning event
                if (Math.random() > 0.8) {
                    this.simulateLearningEvent(agentId);
                }
            }
        });
        
        // Update system metrics
        this.syndicateData.systemMetrics.systemUptime = Date.now() - (Date.now() - 300000); // 5 min ago
        this.syndicateData.systemMetrics.totalLearningEvents += Math.floor(Math.random() * 3);
        
        // Broadcast updates
        this.broadcastUpdate({
            type: 'agent_update',
            data: Array.from(this.syndicateData.agents.entries())
        });
        
        this.broadcastUpdate({
            type: 'metrics_update', 
            data: this.syndicateData.systemMetrics
        });
    }
    
    /**
     * ⚡ SIMULATE OPPORTUNITY DETECTION
     */
    simulateOpportunityDetection(agentId) {
        const constructionPhases = ['LP1_Grundlagenermittlung', 'LP2_Vorplanung', 'LP3_Entwurfsplanung', 'LP6_Vorbereitung_Vergabe', 'LP7_Mitwirkung_Vergabe'];
        const projectTypes = ['Residential', 'Commercial', 'Industrial', 'Infrastructure'];
        
        const opportunity = {
            id: `opp_${Date.now()}`,
            agentId: agentId,
            phase: constructionPhases[Math.floor(Math.random() * constructionPhases.length)],
            projectType: projectTypes[Math.floor(Math.random() * projectTypes.length)],
            complianceGap: 0.5 + Math.random() * 3, // 0.5% to 3.5% compliance issues
            estimatedCostSavings: Math.floor(100 + Math.random() * 5000),
            detectedAt: Date.now(),
            status: Math.random() > 0.3 ? 'executed' : 'analyzing'
        };
        
        this.syndicateData.opportunities.push(opportunity);
        this.syndicateData.systemMetrics.totalOpportunities++;
        
        // Add to recent activity
        this.addRecentActivity({
            type: 'opportunity_detected',
            agent: agentId,
            message: `${opportunity.complianceGap.toFixed(2)}% compliance optimization detected in ${opportunity.phase}`,
            timestamp: Date.now(),
            data: opportunity
        });
        
        console.log(`⚡ ${agentId}: Detected ${opportunity.complianceGap.toFixed(2)}% compliance optimization in ${opportunity.phase}`);
    }
    
    /**
     * 🧠 SIMULATE LEARNING EVENT
     */
    simulateLearningEvent(agentId) {
        const learningTypes = ['genetic_evolution', 'quantum_learning', 'transformer_optimization', 'world_model_update'];
        
        const learningEvent = {
            id: `learn_${Date.now()}`,
            agentId: agentId,
            type: learningTypes[Math.floor(Math.random() * learningTypes.length)],
            improvement: Math.random() * 0.1, // 0-10% improvement
            timestamp: Date.now()
        };
        
        // Add to recent activity
        this.addRecentActivity({
            type: 'learning_event',
            agent: agentId,
            message: `Learning improvement: ${(learningEvent.improvement * 100).toFixed(1)}%`,
            timestamp: Date.now(),
            data: learningEvent
        });
        
        console.log(`🧠 ${agentId}: Learning event - ${(learningEvent.improvement * 100).toFixed(1)}% improvement`);
    }
    
    /**
     * 📝 ADD RECENT ACTIVITY
     */
    addRecentActivity(activity) {
        this.syndicateData.recentActivity.push(activity);
        
        // Keep only last 100 activities
        if (this.syndicateData.recentActivity.length > 100) {
            this.syndicateData.recentActivity = this.syndicateData.recentActivity.slice(-100);
        }
        
        // Broadcast activity update
        this.broadcastUpdate({
            type: 'activity_update',
            data: activity
        });
    }
    
    /**
     * 💬 HANDLE CLIENT MESSAGE
     */
    handleClientMessage(ws, message) {
        console.log('📨 Received message:', message.type);
        
        switch (message.type) {
            case 'get_agents':
                this.sendToClient(ws, {
                    type: 'agents_data',
                    data: Array.from(this.syndicateData.agents.entries())
                });
                break;
                
            case 'get_opportunities':
                this.sendToClient(ws, {
                    type: 'opportunities_data',
                    data: this.syndicateData.opportunities.slice(-50) // Last 50 opportunities
                });
                break;
                
            case 'get_metrics':
                this.sendToClient(ws, {
                    type: 'metrics_data',
                    data: this.syndicateData.systemMetrics
                });
                break;
                
            default:
                console.log(`❓ Unknown message type: ${message.type}`);
        }
    }
    
    /**
     * 📤 SEND MESSAGE TO CLIENT
     */
    sendToClient(ws, message) {
        try {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error('❌ Error sending to client:', error.message);
        }
    }
    
    /**
     * 📡 BROADCAST UPDATE TO ALL CLIENTS
     */
    broadcastUpdate(message) {
        const messageStr = JSON.stringify(message);
        
        this.clients.forEach(ws => {
            try {
                if (ws.readyState === ws.OPEN) {
                    ws.send(messageStr);
                }
            } catch (error) {
                console.error('❌ Error broadcasting to client:', error.message);
                this.clients.delete(ws);
            }
        });
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    shutdown() {
        console.log('🛑 Shutting down Web GUI Backend...');
        
        if (this.mockDataInterval) {
            clearInterval(this.mockDataInterval);
        }
        
        if (this.wss) {
            this.wss.close();
        }
        
        console.log('✅ Web GUI Backend shutdown complete');
    }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    console.log('🌐 ELITE SYNDICATE WEB GUI BACKEND');
    console.log('==================================');
    
    const backend = new SyndicateWebGUIBackend();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\\n🛑 Received shutdown signal...');
        backend.shutdown();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\\n🛑 Received termination signal...');
        backend.shutdown();
        process.exit(0);
    });
    
    try {
        await backend.start();
        console.log('🎉 WEB GUI BACKEND IS LIVE!');
        console.log('📡 Ready to stream syndicate data to React frontend');
        
    } catch (error) {
        console.error('💥 CRITICAL ERROR:', error);
        process.exit(1);
    }
}

// Execute if this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 FATAL ERROR:', error);
        process.exit(1);
    });
}

export { SyndicateWebGUIBackend };
