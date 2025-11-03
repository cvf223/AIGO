#!/usr/bin/env node

/**
 * 🚀 MINIMAL GUI LAUNCHER - NO LLM DEPENDENCIES
 * ==============================================
 * 
 * Starts ONLY the web interface without waiting for LLMs or main syndicate
 * This gets the GUI online immediately for monitoring and basic controls
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MinimalConstructionGUI {
    constructor() {
        this.port = 3001;
        this.app = null;
        this.httpServer = null;
        this.io = null;
        
        console.log('🚀 Minimal Construction GUI initializing...');
    }
    
    async initialize() {
        console.log('⚡ FAST INITIALIZATION - NO LLM DEPENDENCIES');
        
        // Create Express app
        this.app = express();
        
        // Basic middleware
        this.app.use(express.json());
        this.app.use(express.static('src/web/public'));
        
        // Serve the extraordinary GUI
        const extraordinaryGuiPath = join(process.cwd(), 'src', 'web', 'public');
        if (fs.existsSync(extraordinaryGuiPath)) {
            console.log('🌟 Serving EXTRAORDINARY GUI');
            this.app.use(express.static(extraordinaryGuiPath));
            this.app.get('/', (req, res) => {
                res.sendFile(join(extraordinaryGuiPath, 'ultimate-gui.html'));
            });
            this.app.get('/chat', (req, res) => {
                res.sendFile(join(extraordinaryGuiPath, 'ultimate-gui.html'));
            });
        }
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'minimal_mode',
                message: 'GUI running without LLM dependencies',
                timestamp: Date.now()
            });
        });
        
        // Basic API endpoints
        this.app.get('/api/agents', (req, res) => {
            res.json({
                success: true,
                agents: [
                    { id: 'head-architect', name: 'Head Architect', status: 'offline' },
                    { id: 'structural-engineer', name: 'Structural Engineer', status: 'offline' },
                    { id: 'quantity-surveyor', name: 'Quantity Surveyor', status: 'offline' }
                ],
                message: 'Main syndicate offline - agents unavailable'
            });
        });
        
        // 🎯 REAL-TIME SYNDICATE STATUS - Polls actual main syndicate
        this.app.get('/api/syndicate/status', async (req, res) => {
            try {
                const { execSync } = await import('child_process');
                
                // Get PM2 process list
                const pm2List = execSync('pm2 jlist', { encoding: 'utf8' });
                const processes = JSON.parse(pm2List);
                const mainSyndicate = processes.find(p => p.name === 'aigo-syndicate-main');
                
                if (!mainSyndicate || mainSyndicate.pm2_env.status !== 'online') {
                    return res.json({
                        success: true,
                        connected: false,
                        message: 'Main syndicate offline',
                        timestamp: Date.now()
                    });
                }
                
                // Get recent logs to extract status
                const logs = execSync(`pm2 logs aigo-syndicate-main --lines 500 --nostream`, { encoding: 'utf8' });
                
                // Extract current step (improved regex)
                const stepMatches = logs.match(/Step (\d+):/g);
                let currentStep = null;
                if (stepMatches && stepMatches.length > 0) {
                    const lastStep = stepMatches[stepMatches.length - 1];
                    const stepNum = lastStep.match(/\d+/);
                    currentStep = stepNum ? parseInt(stepNum[0]) : null;
                }
                
                // Extract LLM status (check for model-specific ready messages)
                const llmStatuses = {
                    'qwen2.5:72b-instruct-fp16': logs.includes('qwen2.5:72b') && logs.includes('ready'),
                    'mistral:7b-instruct-fp16': logs.includes('mistral:7b') && logs.includes('ready'),
                    'llava:34b': logs.includes('llava:34b') && logs.includes('ready'),
                    'phi3:14b': logs.includes('phi3:14b') && logs.includes('ready'),
                    'llama3.3:70b': logs.includes('llama3.3:70b') && logs.includes('ready')
                };
                const llmReady = Object.values(llmStatuses).filter(Boolean).length;
                const llmTotal = 5;
                
                // Extract memory usage
                const memoryMB = Math.round(mainSyndicate.monit.memory / (1024 * 1024));
                const memoryGB = (memoryMB / 1024).toFixed(2);
                
                // Check if on Step 8 (GUI should be started)
                const guiReady = logs.includes('Step 8') && logs.includes('Construction GUI');
                
                // Build status message
                let statusMessage;
                if (guiReady) {
                    statusMessage = '✅ Syndicate fully initialized';
                } else if (currentStep) {
                    statusMessage = `🔄 Initializing... Step ${currentStep}/8`;
                } else {
                    statusMessage = `🔄 Initializing early systems... (${llmReady}/${llmTotal} LLMs ready)`;
                }
                
                res.json({
                    success: true,
                    connected: true,
                    currentStep,
                    totalSteps: 8,
                    llmsLoaded: llmReady,
                    llmsTotal: llmTotal,
                    llmDetails: llmStatuses,
                    memoryMB,
                    memoryGB,
                    uptime: mainSyndicate.pm2_env.pm_uptime,
                    uptimeMinutes: Math.floor((Date.now() - mainSyndicate.pm2_env.pm_uptime) / 60000),
                    guiReady,
                    message: statusMessage,
                    timestamp: Date.now()
                });
                
            } catch (error) {
                res.json({
                    success: false,
                    connected: false,
                    error: error.message,
                    timestamp: Date.now()
                });
            }
        });
        
        this.app.get('/api/llm/models', (req, res) => {
            res.json({
                success: true,
                models: {
                    primary: 'offline',
                    fast: 'offline',
                    vision: 'offline'
                },
                message: 'LLMs offline - main syndicate needs restart'
            });
        });
        
        // Create HTTP server
        this.httpServer = createServer(this.app);
        
        // Basic Socket.IO
        this.io = new SocketIOServer(this.httpServer, {
            cors: { origin: "*", credentials: true }
        });
        
        this.io.on('connection', (socket) => {
            console.log(`🔗 Client connected: ${socket.id}`);
            
            // Send status
            socket.emit('connected', {
                status: 'minimal_mode',
                message: 'GUI online - main syndicate offline',
                timestamp: Date.now()
            });
            
            // Handle basic requests
            socket.on('chatWithLLM', (data) => {
                socket.emit('chatResponse', {
                    response: 'LLM services offline. Main syndicate needs restart.',
                    error: true,
                    timestamp: Date.now()
                });
            });
            
            socket.on('getAgentsStatus', () => {
                socket.emit('agentsStatusResponse', {
                    status: {
                        totalAgents: 0,
                        activeAgents: 0,
                        message: 'Main syndicate offline'
                    },
                    timestamp: Date.now()
                });
            });
            
            socket.on('disconnect', () => {
                console.log(`👋 Client disconnected: ${socket.id}`);
            });
        });
        
        console.log('✅ Minimal GUI initialized');
    }
    
    async start() {
        return new Promise((resolve, reject) => {
            this.httpServer.listen(this.port, '0.0.0.0', () => {
                console.log('\n' + '='.repeat(70));
                console.log('🎉 MINIMAL CONSTRUCTION GUI ONLINE');
                console.log('='.repeat(70));
                console.log(`🌐 Web Interface: http://162.55.83.33:${this.port}`);
                console.log(`🔌 WebSocket: ws://162.55.83.33:${this.port}`);
                console.log('💡 Status: Running without LLM dependencies');
                console.log('⚠️  To restore full functionality: Fix main syndicate');
                console.log('='.repeat(70) + '\n');
                resolve();
            });
            
            this.httpServer.on('error', reject);
        });
    }
}

// Start the minimal GUI
async function main() {
    try {
        const gui = new MinimalConstructionGUI();
        await gui.initialize();
        await gui.start();
    } catch (error) {
        console.error('❌ Minimal GUI failed to start:', error);
        process.exit(1);
    }
}

main();
