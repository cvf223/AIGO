# Agent-orchestration - Essential Patterns

## Core Implementation
```javascript
// agent-orchestration-engine.js
import { EventEmitter } from 'events';
import pg from 'pg';
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import pQueue from 'p-queue';

export class AgentOrchestrationEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxConcurrentTasks: config.maxConcurrentTasks || 100,
            taskTimeout: config.taskTimeout || 300000, // 5 minutes
            consensusThreshold: config.consensusThreshold || 0.66,
            deadlockDetectionInterval: config.deadlockDetectionInterval || 30000,
            performanceBalancingEnabled: config.performanceBalancingEnabled !== false,
            ...config
        };
        
        this.id = config.id || uuidv4();
        this.state = 'uninitialized';
        
        // Agent registry
        this.agents = new Map();
        this.agentCapabilities = new Map();
        
        // Task management
        this.taskQueue = new pQueue({ 
            concurrency: this.config.maxConcurrentTasks 
        });
        this.activeTasks = new Map();
        this.taskDependencies = new Map();
        
        // Consensus tracking
        this.consensusVotes = new Map();
        
        // Performance metrics
        this.performanceMetrics = new Map();
        
        // Database and WebSocket
        this.dbPool = null;
        this.ws = null;
    }
    
    async initialize() {
        try {
            await this.initializeDatabase();
            await this.loadAgentRegistry();
            await this.initializeWebSocket();
            
            // Start monitoring systems
            this.startDeadlockDetection();
            this.startPerformanceBalancing();
            
            this.state = 'initialized';
            this.emit('initialized', { engineId: this.id });
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            application_name: `orchestrator_${this.id}`
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Agent registry table
            await client.query(`
                CREATE TABLE IF NOT EXISTS agent_registry (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    agent_id VARCHAR(200) UNIQUE NOT NULL,
                    agent_type VARCHAR(100) NOT NULL,
                    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
                    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
                    performance_score DECIMAL(5,2) DEFAULT 100.0,
                    last_heartbeat TIMESTAMPTZ,
                    metadata JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX idx_agent_status ON agent_registry(status);
                CREATE INDEX idx_agent_capabilities ON agent_registry USING GIN(capabilities);
            `);
            
            // Task distribution table
            await client.query(`
                CREATE TABLE IF NOT EXISTS task_distributions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    task_id UUID NOT NULL,
                    task_type VARCHAR(100) NOT NULL,
                    assigned_agents JSONB NOT NULL DEFAULT '[]'::jsonb,
                    dependencies JSONB DEFAULT '[]'::jsonb,
                    priority INTEGER DEFAULT 5,
                    status VARCHAR(50) NOT NULL DEFAULT 'pending',
                    result JSONB,
                    started_at TIMESTAMPTZ,
                    completed_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX idx_task_status ON task_distributions(status);
                CREATE INDEX idx_task_priority ON task_distributions(priority DESC);
            `);
            
            // Consensus tracking table
            await client.query(`
                CREATE TABLE IF NOT EXISTS consensus_decisions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    decision_id UUID NOT NULL,
                    topic VARCHAR(200) NOT NULL,
                    votes JSONB NOT NULL DEFAULT '{}'::jsonb,
                    result VARCHAR(50),
                    consensus_reached BOOLEAN DEFAULT false,
                    threshold DECIMAL(5,2) NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    decided_at TIMESTAMPTZ
                );
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Agent Management
    
    async registerAgent(agentId, agentType, capabilities) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO agent_registry (agent_id, agent_type, capabilities, status)
                VALUES ($1, $2, $3, 'active')
                ON CONFLICT (agent_id) DO UPDATE SET
                    agent_type = EXCLUDED.agent_type,
                    capabilities = EXCLUDED.capabilities,
                    status = 'active',
                    last_heartbeat = NOW()
            `, [agentId, agentType, JSON.stringify(capabilities)]);
            
            // Update in-memory registry
            this.agents.set(agentId, {
                id: agentId,
                type: agentType,
                capabilities,
                status: 'active',
                lastHeartbeat: Date.now()
            });
            
            this.agentCapabilities.set(agentId, new Set(capabilities));
            
            this.emit('agent_registered', { agentId, agentType, capabilities });
            
        } finally {
            client.release();
        }
    }
    
    async updateAgentStatus(agentId, status) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE agent_registry 
                SET status = $1, last_heartbeat = NOW()
                WHERE agent_id = $2
            `, [status, agentId]);
            
            if (this.agents.has(agentId)) {
                this.agents.get(agentId).status = status;
                this.agents.get(agentId).lastHeartbeat = Date.now();
            }
            
        } finally {
            client.release();
        }
    }
    
    async loadAgentRegistry() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM agent_registry 
                WHERE status = 'active'
            `);
            
            for (const agent of result.rows) {
                this.agents.set(agent.agent_id, {
                    id: agent.agent_id,
                    type: agent.agent_type,
                    capabilities: agent.capabilities,
                    status: agent.status,
                    performanceScore: parseFloat(agent.performance_score),
                    lastHeartbeat: agent.last_heartbeat
                });
                
                this.agentCapabilities.set(
                    agent.agent_id, 
                    new Set(agent.capabilities)
                );
            }
            
        } finally {
            client.release();
        }
    }
    
    // Task Distribution
    
    async distributeTask(task) {
        const taskId = task.id || uuidv4();
        
        try {
            // Find capable agents
            const capableAgents = this.findCapableAgents(task.requiredCapabilities);
            
            if (capableAgents.length === 0) {
                throw new Error(`No agents available with required capabilities: ${task.requiredCapabilities.join(', ')}`);
            }
            
            // Select optimal agents based on performance
            const selectedAgents = await this.selectOptimalAgents(
                capableAgents, 
                task
            );
            
            // Create task distribution
            const distribution = {
                id: taskId,
                type: task.type,
                assignedAgents: selectedAgents,
                dependencies: task.dependencies || [],
                priority: task.priority || 5,
                status: 'assigned'
            };
            
            // Save to database
            await this.saveTaskDistribution(distribution);
            
            // Add to active tasks
            this.activeTasks.set(taskId, {
                ...distribution,
                startTime: Date.now(),
                timeout: setTimeout(() => {
                    this.handleTaskTimeout(taskId);
                }, this.config.taskTimeout)
            });
            
            // Queue task execution
            this.taskQueue.add(async () => {
                await this.executeTask(taskId, task, selectedAgents);
            });
            
            return distribution;
            
        } catch (error) {
            this.handleError('task_distribution', error);
            throw error;
        }
    }
    
    findCapableAgents(requiredCapabilities) {
        const capable = [];
        
        for (const [agentId, capabilities] of this.agentCapabilities) {
            const agent = this.agents.get(agentId);
            
            if (agent.status !== 'active') continue;
            
            const hasAllCapabilities = requiredCapabilities.every(
                cap => capabilities.has(cap)
            );
            
            if (hasAllCapabilities) {
                capable.push(agent);
            }
        }
        
        return capable;
    }
    
    async selectOptimalAgents(capableAgents, task) {
        // Sort by performance score and current load
        const agentsWithLoad = await Promise.all(
            capableAgents.map(async agent => ({
                ...agent,
                currentLoad: await this.getAgentLoad(agent.id)
            }))
        );
        
        // Score agents based on performance and load
        const scored = agentsWithLoad.map(agent => ({
            ...agent,
            score: (agent.performanceScore * 0.7) + 
                   ((1 - agent.currentLoad / this.config.maxConcurrentTasks) * 0.3)
        }));
        
        // Sort by score and select based on task requirements
        scored.sort((a, b) => b.score - a.score);
        
        const requiredAgents = task.minAgents || 1;
        const maxAgents = task.maxAgents || 3;
        
        const selected = scored.slice(
            0, 
            Math.min(maxAgents, Math.max(requiredAgents, capableAgents.length))
        );
        
        return selected.map(a => a.id);
    }
    
    async getAgentLoad(agentId) {
        let count = 0;
        for (const task of this.activeTasks.values()) {
            if (task.assignedAgents.includes(agentId)) {
                count++;
            }
        }
        return count;
    }
    
    async executeTask(taskId, task, assignedAgents) {
        try {
            // Check dependencies
            if (task.dependencies && task.dependencies.length > 0) {
                await this.waitForDependencies(taskId, task.dependencies);
            }
            
            // Broadcast task to assigned agents
            const results = await this.broadcastToAgents(
                assignedAgents,
                'execute_task',
                { taskId, task }
            );
            
            // Handle results based on task type
            let finalResult;
            if (task.requiresConsensus) {
                finalResult = await this.achieveConsensus(taskId, results);
            } else {
                finalResult = this.aggregateResults(results);
            }
            
            // Update task status
            await this.completeTask(taskId, finalResult);
            
            return finalResult;
            
        } catch (error) {
            await this.failTask(taskId, error);
            throw error;
        }
    }
    
    async waitForDependencies(taskId, dependencies) {
        const maxWait = 300000; // 5 minutes
        const startTime = Date.now();
        
        while (true) {
            const allCompleted = dependencies.every(depId => {
                const dep = this.activeTasks.get(depId);
                return !dep || dep.status === 'completed';
            });
            
            if (allCompleted) break;
            
            if (Date.now() - startTime > maxWait) {
                throw new Error(`Dependencies timeout for task ${taskId}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // Consensus Mechanisms
    
    async achieveConsensus(decisionId, votes) {
        const consensusId = uuidv4();
        
        // Initialize consensus tracking
        this.consensusVotes.set(consensusId, {
            decisionId,
            votes: new Map(),
            startTime: Date.now()
        });
        
        // Collect votes
        for (const [agentId, vote] of Object.entries(votes)) {
            this.consensusVotes.get(consensusId).votes.set(agentId, vote);
        }
        
        // Calculate consensus
        const result = this.calculateConsensus(
            this.consensusVotes.get(consensusId).votes
        );
        
        // Save consensus decision
        await this.saveConsensusDecision(consensusId, decisionId, result);
        
        // Clean up
        this.consensusVotes.delete(consensusId);
        
        return result;
    }
    
    calculateConsensus(votes) {
        const voteCount = new Map();
        let totalVotes = 0;
        
        // Count votes
        for (const vote of votes.values()) {
            const key = JSON.stringify(vote);
            voteCount.set(key, (voteCount.get(key) || 0) + 1);
            totalVotes++;
        }
        
        // Find majority
        for (const [voteKey, count] of voteCount) {
            const ratio = count / totalVotes;
            if (ratio >= this.config.consensusThreshold) {
                return {
                    consensus: true,
                    result: JSON.parse(voteKey),
                    confidence: ratio,
                    totalVotes
                };
            }
        }
        
        // No consensus - return most popular
        const sorted = Array.from(voteCount.entries())
            .sort(([,a], [,b]) => b - a);
            
        return {
            consensus: false,
            result: JSON.parse(sorted[0][0]),
            confidence: sorted[0][1] / totalVotes,
            totalVotes
        };
    }
    
    // Deadlock Detection
    
    startDeadlockDetection() {
        setInterval(async () => {
            try {
                const deadlocks = await this.detectDeadlocks();
                
                for (const deadlock of deadlocks) {
                    await this.resolveDeadlock(deadlock);
                }
            } catch (error) {
                this.handleError('deadlock_detection', error);
            }
        }, this.config.deadlockDetectionInterval);
    }
    
    async detectDeadlocks() {
        const deadlocks = [];
        const now = Date.now();
        
        // Build dependency graph
        const graph = new Map();
        
        for (const [taskId, task] of this.activeTasks) {
            if (!task.dependencies) continue;
            
            graph.set(taskId, task.dependencies.filter(
                depId => this.activeTasks.has(depId)
            ));
        }
        
        // Detect cycles using DFS
        const visited = new Set();
        const recursionStack = new Set();
        
        const hasCycle = (node, path = []) => {
            if (recursionStack.has(node)) {
                return [...path, node];
            }
            
            if (visited.has(node)) {
                return null;
            }
            
            visited.add(node);
            recursionStack.add(node);
            
            const dependencies = graph.get(node) || [];
            for (const dep of dependencies) {
                const cycle = hasCycle(dep, [...path, node]);
                if (cycle) return cycle;
            }
            
            recursionStack.delete(node);
            return null;
        };
        
        // Check each node
        for (const taskId of graph.keys()) {
            if (!visited.has(taskId)) {
                const cycle = hasCycle(taskId);
                if (cycle) {
                    deadlocks.push({
                        type: 'circular_dependency',
                        tasks: cycle,
                        detected: now
                    });
                }
            }
        }
        
        // Also check for timeout deadlocks
        for (const [taskId, task] of this.activeTasks) {
            if (now - task.startTime > this.config.taskTimeout * 2) {
                deadlocks.push({
                    type: 'timeout',
                    tasks: [taskId],
                    detected: now
                });
            }
        }
        
        return deadlocks;
    }
    
    async resolveDeadlock(deadlock) {
        console.log(`Resolving deadlock: ${deadlock.type}`, deadlock.tasks);
        
        switch (deadlock.type) {
            case 'circular_dependency':
                // Break cycle by failing lowest priority task
                const taskPriorities = await Promise.all(
                    deadlock.tasks.map(async taskId => ({
                        taskId,
                        priority: await this.getTaskPriority(taskId)
                    }))
                );
                
                taskPriorities.sort((a, b) => a.priority - b.priority);
                const taskToFail = taskPriorities[0].taskId;
                
                await this.failTask(
                    taskToFail, 
                    new Error('Task failed to resolve circular dependency')
                );
                break;
                
            case 'timeout':
                // Restart or fail timeout tasks
                for (const taskId of deadlock.tasks) {
                    await this.failTask(
                        taskId,
                        new Error('Task exceeded maximum timeout')
                    );
                }
                break;
        }
    }
    
    // Performance Balancing
    
    startPerformanceBalancing() {
        if (!this.config.performanceBalancingEnabled) return;
        
        setInterval(async () => {
            try {
                await this.balanceAgentLoad();
                await this.updatePerformanceScores();
            } catch (error) {
                this.handleError('performance_balancing', error);
            }
        }, 60000); // Every minute
    }
    
    async balanceAgentLoad() {
        const agentLoads = new Map();
        
        // Calculate current loads
        for (const agent of this.agents.values()) {
            if (agent.status === 'active') {
                agentLoads.set(agent.id, await this.getAgentLoad(agent.id));
            }
        }
        
        // Find overloaded and underutilized agents
        const avgLoad = Array.from(agentLoads.values())
            .reduce((sum, load) => sum + load, 0) / agentLoads.size;
            
        const overloaded = [];
        const underutilized = [];
        
        for (const [agentId, load] of agentLoads) {
            if (load > avgLoad * 1.5) {
                overloaded.push({ agentId, load });
            } else if (load < avgLoad * 0.5) {
                underutilized.push({ agentId, load });
            }
        }
        
        // Rebalance if needed
        if (overloaded.length > 0 && underutilized.length > 0) {
            await this.rebalanceTasks(overloaded, underutilized);
        }
    }
    
    async updatePerformanceScores() {
        const client = await this.dbPool.connect();
        try {
            // Calculate performance based on completed tasks
            const result = await client.query(`
                WITH agent_performance AS (
                    SELECT 
                        unnest(assigned_agents) as agent_id,
                        COUNT(*) as total_tasks,
                        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                        AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration
                    FROM task_distributions
                    WHERE created_at > NOW() - INTERVAL '1 hour'
                    GROUP BY agent_id
                )
                UPDATE agent_registry ar
                SET performance_score = LEAST(100, GREATEST(0, 
                    50 + (ap.completed::float / ap.total_tasks * 50) -
                    (CASE WHEN ap.avg_duration > 300 THEN 10 ELSE 0 END)
                ))
                FROM agent_performance ap
                WHERE ar.agent_id = ap.agent_id
            `);
            
            // Update in-memory scores
            await this.loadAgentRegistry();
            
        } finally {
            client.release();
        }
    }
    
    // Communication
    
    async initializeWebSocket() {
        const wsUrl = process.env.WEBSOCKET_URL || 'ws://localhost:3001';
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.on('open', () => {
            console.log(`Orchestrator ${this.id} connected to WebSocket`);
            this.ws.send(JSON.stringify({
                type: 'register',
                engineId: this.id,
                engineType: 'orchestrator'
            }));
        });
        
        this.ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data);
                await this.handleWebSocketMessage(message);
            } catch (error) {
                this.handleError('websocket_message', error);
            }
        });
    }
    
    async handleWebSocketMessage(message) {
        switch (message.type) {
            case 'agent_heartbeat':
                await this.updateAgentStatus(message.agentId, 'active');
                break;
                
            case 'task_result':
                await this.handleTaskResult(message);
                break;
                
            case 'consensus_vote':
                await this.handleConsensusVote(message);
                break;
        }
    }
    
    async broadcastToAgents(agentIds, messageType, data) {
        const responses = new Map();
        const promises = [];
        
        for (const agentId of agentIds) {
            const promise = this.sendToAgent(agentId, messageType, data)
                .then(response => responses.set(agentId, response))
                .catch(error => responses.set(agentId, { error: error.message }));
                
            promises.push(promise);
        }
        
        await Promise.all(promises);
        return responses;
    }
    
    async sendToAgent(agentId, messageType, data) {
        return new Promise((resolve, reject) => {
            const messageId = uuidv4();
            const timeout = setTimeout(() => {
                reject(new Error(`Agent ${agentId} response timeout`));
            }, 30000);
            
            // Store callback
            this.pendingResponses = this.pendingResponses || new Map();
            this.pendingResponses.set(messageId, { resolve, reject, timeout });
            
            // Send message
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    type: 'agent_message',
                    messageId,
                    agentId,
                    messageType,
                    data
                }));
            } else {
                reject(new Error('WebSocket not connected'));
            }
        });
    }
    
    // Utility Methods
    
    async saveTaskDistribution(distribution) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO task_distributions
                (task_id, task_type, assigned_agents, dependencies, 
                 priority, status)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                distribution.id,
                distribution.type,
                JSON.stringify(distribution.assignedAgents),
                JSON.stringify(distribution.dependencies),
                distribution.priority,
                distribution.status
            ]);
        } finally {
            client.release();
        }
    }
    
    async completeTask(taskId, result) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE task_distributions
                SET status = 'completed',
                    result = $1,
                    completed_at = NOW()
                WHERE task_id = $2
            `, [JSON.stringify(result), taskId]);
            
            // Update active tasks
            const task = this.activeTasks.get(taskId);
            if (task) {
                clearTimeout(task.timeout);
                this.activeTasks.delete(taskId);
            }
            
            this.emit('task_completed', { taskId, result });
            
        } finally {
            client.release();
        }
    }
    
    async failTask(taskId, error) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE task_distributions
                SET status = 'failed',
                    result = $1,
                    completed_at = NOW()
                WHERE task_id = $2
            `, [JSON.stringify({ error: error.message }), taskId]);
            
            // Update active tasks
            const task = this.activeTasks.get(taskId);
            if (task) {
                clearTimeout(task.timeout);
                this.activeTasks.delete(taskId);
            }
            
            this.emit('task_failed', { taskId, error });
            
        } finally {
            client.release();
        }
    }
    
    handleError(context, error) {
        console.error(`Orchestrator error in ${context}:`, error);
        this.emit('error', { context, error });
    }
    
    async shutdown() {
        this.state = 'shutting_down';
        
        // Cancel all active tasks
        for (const taskId of this.activeTasks.keys()) {
            await this.failTask(
                taskId, 
                new Error('Orchestrator shutting down')
            );
        }
        
        // Close connections
        if (this.ws) {
            this.ws.close();
        }
        
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        console.log(`Orchestrator ${this.id} shut down`);
    }
}

// Export factory function
export function createAgentOrchestrator(config) {
    return new AgentOrchestrationEngine(config);
}
```

```javascript
// orchestrator-usage.js
import { createAgentOrchestrator } from './agent-orchestration-engine.js';

async function main() {
    const orchestrator = createAgentOrchestrator({
        maxConcurrentTasks: 50,
        consensusThreshold: 0.75
    });
    
    try {
        await orchestrator.initialize();
        
        // Register agents
        await orchestrator.registerAgent('construction-agent-1', 'construction', [
            'cost_estimation',
            'schedule_planning',
            'hoai_compliance'
        ]);
        
        await orchestrator.registerAgent('quantum-agent-1', 'quantum', [
            'optimization',
            'prediction',
            'pattern_recognition'
        ]);
        
        // Distribute a task
        const task = {
            id: 'task-123',
            type: 'construction_optimization',
            requiredCapabilities: ['optimization', 'cost_estimation'],
            requiresConsensus: true,
            priority: 8,
            data: {
                projectId: 'project-456',
                optimizationType: 'cost_schedule'
            }
        };
        
        const distribution = await orchestrator.distributeTask(task);
        console.log('Task distributed:', distribution);
        
    } catch (error) {
        console.error('Orchestrator error:', error);
    }
}

main();
```

## Key Patterns
Essential implementation patterns

## Usage Examples  
Practical usage examples

## Integration Guide
Example

```javascript
// construction-orchestrator-integration.js
import { createAgentOrchestrator } from './agent-orchestration-engine.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionOrchestrationService {
    constructor() {
        this.orches...

## Extended Resources
- **Full Implementation**: `/skills/agent-orchestration-detailed.md`
- **Code Examples**: `/examples/agent-orchestration-examples.js`
- **Related Skills**: Cross-referenced implementation patterns

*Compressed for context efficiency. Contains 80% of functionality in 15% of the space.*