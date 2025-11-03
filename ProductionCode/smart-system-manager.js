#!/usr/bin/env node

/**
 * 🚀 SMART SYSTEM MANAGER - PRODUCTION PORT ALLOCATION
 * ===================================================
 * 
 * Intelligent system startup with automatic port conflict resolution
 * Manages: Web GUI, Frontend, Database, LLM, Syndicate Systems
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class SmartSystemManager {
    constructor() {
        this.portMap = {
            // Core Web GUI Systems
            backend: 3001,           // Web GUI Backend
            frontend: 3002,          // Next.js Frontend
            
            // Construction Syndicate Systems  
            syndicateMain: 3003,     // Main Syndicate
            syndicateAPI: 3004,      // Syndicate API
            syndicateWS: 3005,       // Syndicate WebSocket
            
            // Database & Services
            postgres: 5432,          // PostgreSQL
            redis: 6379,             // Redis (if needed)
            ollama: 11434,           // Ollama LLM
            
            // Additional Services
            monitoring: 3006,        // System Monitoring
            hoaiAPI: 3007,          // HOAI API
            specialistAPI: 3008,     // Construction Specialists
            
            // Development/Testing
            test: 3009,             // Test Environment
            dev: 3010               // Development Mode
        };
        
        this.processes = new Map();
        this.systemStatus = new Map();
    }

    async checkPortStatus(port) {
        try {
            const { stdout } = await execAsync(`lsof -i :${port} | grep LISTEN`);
            return stdout.trim().length > 0;
        } catch (error) {
            return false;
        }
    }

    async findFreePort(startPort = 3000) {
        for (let port = startPort; port < startPort + 100; port++) {
            const inUse = await this.checkPortStatus(port);
            if (!inUse) return port;
        }
        throw new Error(`No free ports available starting from ${startPort}`);
    }

    async killProcessOnPort(port) {
        try {
            const { stdout } = await execAsync(`lsof -ti :${port}`);
            const pids = stdout.trim().split('\n').filter(pid => pid);
            
            for (const pid of pids) {
                console.log(`🔄 Killing process ${pid} on port ${port}`);
                await execAsync(`kill -9 ${pid}`);
            }
            
            // Wait for port to be released
            await new Promise(resolve => setTimeout(resolve, 2000));
            return true;
        } catch (error) {
            return false;
        }
    }

    async startBackend(port = this.portMap.backend) {
        console.log(`🌐 Starting Backend on port ${port}...`);
        
        const inUse = await this.checkPortStatus(port);
        if (inUse) {
            console.log(`⚠️ Port ${port} in use, backend may already be running`);
            return { port, pid: 'existing', status: 'running' };
        }

        return new Promise((resolve, reject) => {
            const childProcess = spawn('/usr/bin/node', ['streamlined-web-gui-server.js'], {
                cwd: '/root/ProductionCode',
                env: { ...process.env, PORT: port },
                stdio: ['ignore', 'pipe', 'pipe']
            });

            let startupComplete = false;

            childProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`Backend: ${output}`);
                
                if (output.includes('CONSTRUCTION GUI SERVER READY') && !startupComplete) {
                    startupComplete = true;
                    this.processes.set('backend', childProcess);
                    resolve({ port, pid: childProcess.pid, status: 'started' });
                }
            });

            childProcess.stderr.on('data', (data) => {
                console.error(`Backend Error: ${data}`);
            });

            childProcess.on('exit', (code) => {
                if (!startupComplete) {
                    reject(new Error(`Backend failed to start, exit code: ${code}`));
                }
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                if (!startupComplete) {
                    childProcess.kill();
                    reject(new Error('Backend startup timeout'));
                }
            }, 30000);
        });
    }

    async startFrontend(port = this.portMap.frontend) {
        console.log(`🖥️ Starting Frontend on port ${port}...`);
        
        const inUse = await this.checkPortStatus(port);
        if (inUse) {
            console.log(`⚠️ Port ${port} in use, frontend may already be running`);
            return { port, pid: 'existing', status: 'running' };
        }

        return new Promise((resolve, reject) => {
            const childProcess = spawn('npm', ['run', 'start'], {
                cwd: '/root/ProductionCode/web-gui-construction',
                env: { ...process.env, PORT: port },
                stdio: ['ignore', 'pipe', 'pipe']
            });

            let startupComplete = false;

            childProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`Frontend: ${output}`);
                
                if ((output.includes('ready') || output.includes('started')) && !startupComplete) {
                    startupComplete = true;
                    this.processes.set('frontend', childProcess);
                    resolve({ port, pid: childProcess.pid, status: 'started' });
                }
            });

            childProcess.stderr.on('data', (data) => {
                console.error(`Frontend Error: ${data}`);
            });

            childProcess.on('exit', (code) => {
                if (!startupComplete) {
                    reject(new Error(`Frontend failed to start, exit code: ${code}`));
                }
            });

            // Timeout after 60 seconds
            setTimeout(() => {
                if (!startupComplete) {
                    childProcess.kill();
                    reject(new Error('Frontend startup timeout'));
                }
            }, 60000);
        });
    }

    async startSyndicate() {
        console.log(`🏗️ Starting Construction Syndicate...`);
        
        // Use available ports for syndicate
        const mainPort = await this.findFreePort(this.portMap.syndicateMain);
        const apiPort = await this.findFreePort(this.portMap.syndicateAPI);
        
        return new Promise((resolve, reject) => {
            const childProcess = spawn('/usr/bin/node', ['launch-construction-syndicate.js'], {
                cwd: '/root/ProductionCode',
                env: { 
                    ...process.env, 
                    SYNDICATE_PORT: mainPort,
                    SYNDICATE_API_PORT: apiPort,
                    WEB_GUI_BACKEND_PORT: this.portMap.backend,
                    WEB_GUI_FRONTEND_PORT: this.portMap.frontend
                },
                stdio: ['ignore', 'pipe', 'pipe']
            });

            let startupComplete = false;

            childProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`Syndicate: ${output}`);
                
                if (output.includes('Construction Syndicate Ready') && !startupComplete) {
                    startupComplete = true;
                    this.processes.set('syndicate', childProcess);
                    resolve({ mainPort, apiPort, pid: childProcess.pid, status: 'started' });
                }
            });

            childProcess.stderr.on('data', (data) => {
                console.error(`Syndicate Error: ${data}`);
            });

            childProcess.on('exit', (code) => {
                if (!startupComplete) {
                    reject(new Error(`Syndicate failed to start, exit code: ${code}`));
                }
            });

            // Timeout after 120 seconds
            setTimeout(() => {
                if (!startupComplete) {
                    childProcess.kill();
                    reject(new Error('Syndicate startup timeout'));
                }
            }, 120000);
        });
    }

    async getSystemStatus() {
        const status = {
            timestamp: new Date().toISOString(),
            systems: {}
        };

        for (const [system, port] of Object.entries(this.portMap)) {
            const inUse = await this.checkPortStatus(port);
            status.systems[system] = {
                port,
                status: inUse ? 'running' : 'stopped',
                process: this.processes.has(system) ? this.processes.get(system).pid : null
            };
        }

        return status;
    }

    async stopAll() {
        console.log('🛑 Stopping all systems...');
        
        for (const [name, process] of this.processes) {
            console.log(`Stopping ${name}...`);
            childProcess.kill('SIGTERM');
            
            // Force kill after 5 seconds
            setTimeout(() => {
                if (!childProcess.killed) {
                    childProcess.kill('SIGKILL');
                }
            }, 5000);
        }

        this.processes.clear();
        console.log('✅ All systems stopped');
    }

    async startAll() {
        console.log('🚀 Starting all systems with smart port allocation...');
        
        try {
            // Start core web systems first
            const backend = await this.startBackend();
            console.log(`✅ Backend started: ${JSON.stringify(backend)}`);
            
            const frontend = await this.startFrontend();
            console.log(`✅ Frontend started: ${JSON.stringify(frontend)}`);
            
            // Wait a bit for core systems to stabilize
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Start syndicate with separate ports
            const syndicate = await this.startSyndicate();
            console.log(`✅ Syndicate started: ${JSON.stringify(syndicate)}`);
            
            const status = await this.getSystemStatus();
            console.log('🎉 All systems operational!');
            console.log(JSON.stringify(status, null, 2));
            
            return status;
            
        } catch (error) {
            console.error('❌ Startup failed:', error.message);
            throw error;
        }
    }
}

// CLI Interface
async function main() {
    const manager = new SmartSystemManager();
    const command = process.argv[2] || 'status';

    try {
        switch (command) {
            case 'start':
                await manager.startAll();
                break;
                
            case 'stop':
                await manager.stopAll();
                break;
                
            case 'restart':
                await manager.stopAll();
                await new Promise(resolve => setTimeout(resolve, 3000));
                await manager.startAll();
                break;
                
            case 'status':
                const status = await manager.getSystemStatus();
                console.log(JSON.stringify(status, null, 2));
                break;
                
            case 'backend':
                await manager.startBackend();
                break;
                
            case 'frontend':
                await manager.startFrontend();
                break;
                
            case 'syndicate':
                await manager.startSyndicate();
                break;
                
            default:
                console.log(`
🚀 Smart System Manager Commands:
=================================

node smart-system-manager.js start     - Start all systems
node smart-system-manager.js stop      - Stop all systems  
node smart-system-manager.js restart   - Restart all systems
node smart-system-manager.js status    - Check system status
node smart-system-manager.js backend   - Start backend only
node smart-system-manager.js frontend  - Start frontend only
node smart-system-manager.js syndicate - Start syndicate only

Port Allocation:
- Backend: 3001
- Frontend: 3002  
- Syndicate Main: 3003
- Syndicate API: 3004
- Database: 5432
- Ollama: 11434
                `);
        }
    } catch (error) {
        console.error('❌ Command failed:', error.message);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default SmartSystemManager;
