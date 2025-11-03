#!/usr/bin/env node

/**
 * 🛠️ TOOL CONTROL GATEWAY - HUMAN-IN-THE-LOOP SYSTEM
 * ===================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION FOR TOOL CONTROL & INTERVENTION
 * 
 * This gateway provides:
 * - Real-time tool selection override
 * - Pre-execution approval workflows
 * - Tool chain building and management
 * - Intervention points with pause/resume/rollback
 * - Step-through debugging for agent decisions
 * 
 * @author Elite Construction AI Syndicate
 * @version 2.0.0 - Production Powerhouse
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';

// Database
import { DatabasePoolManager } from '../database/DatabasePoolManager.js';

/**
 * 🛠️ TOOL CONTROL GATEWAY - SUPERINTELLIGENCE CONTROL
 */
export class ToolControlGateway extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enablePreExecutionApproval: config.enablePreExecutionApproval !== false,
            enableStepThrough: config.enableStepThrough !== false,
            enableRollback: config.enableRollback !== false,
            approvalTimeout: config.approvalTimeout || 30000, // 30 seconds
            maxRollbackSteps: config.maxRollbackSteps || 10,
            criticalTools: config.criticalTools || [
                'execute_trade',
                'deploy_contract',
                'transfer_funds',
                'delete_data',
                'modify_system'
            ],
            ...config
        };
        
        // Database
        this.dbPool = null;
        
        // Tool registry
        this.availableTools = new Map();
        this.toolOverrides = new Map();
        this.toolChains = new Map();
        this.toolCategories = new Map();
        
        // Execution control
        this.pendingApprovals = new Map();
        this.pausedExecutions = new Map();
        this.executionHistory = new Map();
        this.rollbackStack = new Map();
        
        // Intervention points
        this.interventionPoints = new Map();
        this.breakpoints = new Map();
        this.watchedTools = new Set();
        
        // Step-through debugging
        this.stepThroughSessions = new Map();
        this.debugContexts = new Map();
        
        // Metrics
        this.metrics = {
            totalToolExecutions: 0,
            approvedExecutions: 0,
            rejectedExecutions: 0,
            overriddenTools: 0,
            interventions: 0,
            rollbacks: 0,
            averageApprovalTime: 0
        };
        
        console.log('🛠️ Tool Control Gateway initialized');
    }
    
    /**
     * 🚀 INITIALIZE TOOL CONTROL GATEWAY
     */
    async initialize() {
        console.log('🚀 Initializing Tool Control Gateway...');
        
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Load tool registry
            await this.loadToolRegistry();
            
            // Load saved tool chains
            await this.loadToolChains();
            
            // Setup intervention points
            await this.setupDefaultInterventionPoints();
            
            console.log('✅ Tool Control Gateway initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize Tool Control Gateway:', error);
            throw error;
        }
    }
    
    /**
     * 🗄️ INITIALIZE DATABASE
     */
    async initializeDatabase() {
        const dbManager = DatabasePoolManager.getInstance();
        this.dbPool = await dbManager.getPool();
        
        // Create tool control tables
        await this.createToolControlTables();
    }
    
    /**
     * 📚 LOAD TOOL REGISTRY
     */
    async loadToolRegistry() {
        // Define available tools with metadata
        const tools = [
            // Analysis Tools
            {
                id: 'analyze_data',
                name: 'Data Analyzer',
                category: 'analysis',
                description: 'Analyze data patterns and trends',
                parameters: [
                    { name: 'data', type: 'object', required: true },
                    { name: 'method', type: 'string', defaultValue: 'statistical' }
                ],
                riskLevel: 'low',
                requiredPermissions: ['read']
            },
            {
                id: 'deep_research',
                name: 'Deep Research',
                category: 'analysis',
                description: 'Perform comprehensive research on a topic',
                parameters: [
                    { name: 'query', type: 'string', required: true },
                    { name: 'depth', type: 'number', defaultValue: 3 }
                ],
                riskLevel: 'low',
                requiredPermissions: ['read', 'network']
            },
            
            // Decision Tools
            {
                id: 'evaluate_options',
                name: 'Option Evaluator',
                category: 'decision',
                description: 'Evaluate and rank multiple options',
                parameters: [
                    { name: 'options', type: 'array', required: true },
                    { name: 'criteria', type: 'object', required: true }
                ],
                riskLevel: 'low',
                requiredPermissions: ['read']
            },
            {
                id: 'risk_assessment',
                name: 'Risk Assessor',
                category: 'decision',
                description: 'Assess risks and probabilities',
                parameters: [
                    { name: 'scenario', type: 'object', required: true },
                    { name: 'threshold', type: 'number', defaultValue: 0.5 }
                ],
                riskLevel: 'low',
                requiredPermissions: ['read']
            },
            
            // Execution Tools
            {
                id: 'execute_trade',
                name: 'Trade Executor',
                category: 'execution',
                description: 'Execute a trading operation',
                parameters: [
                    { name: 'trade', type: 'object', required: true },
                    { name: 'slippage', type: 'number', defaultValue: 0.01 }
                ],
                riskLevel: 'critical',
                requiredPermissions: ['write', 'funds']
            },
            {
                id: 'deploy_contract',
                name: 'Contract Deployer',
                category: 'execution',
                description: 'Deploy a smart contract',
                parameters: [
                    { name: 'contract', type: 'object', required: true },
                    { name: 'network', type: 'string', required: true }
                ],
                riskLevel: 'critical',
                requiredPermissions: ['write', 'funds', 'network']
            },
            
            // Data Tools
            {
                id: 'query_database',
                name: 'Database Query',
                category: 'data',
                description: 'Query database for information',
                parameters: [
                    { name: 'query', type: 'string', required: true },
                    { name: 'limit', type: 'number', defaultValue: 100 }
                ],
                riskLevel: 'low',
                requiredPermissions: ['read']
            },
            {
                id: 'modify_data',
                name: 'Data Modifier',
                category: 'data',
                description: 'Modify data in storage',
                parameters: [
                    { name: 'target', type: 'string', required: true },
                    { name: 'changes', type: 'object', required: true }
                ],
                riskLevel: 'high',
                requiredPermissions: ['write']
            },
            
            // Learning Tools
            {
                id: 'train_model',
                name: 'Model Trainer',
                category: 'learning',
                description: 'Train or fine-tune a model',
                parameters: [
                    { name: 'dataset', type: 'string', required: true },
                    { name: 'epochs', type: 'number', defaultValue: 10 }
                ],
                riskLevel: 'medium',
                requiredPermissions: ['compute', 'write']
            },
            {
                id: 'evaluate_model',
                name: 'Model Evaluator',
                category: 'learning',
                description: 'Evaluate model performance',
                parameters: [
                    { name: 'model', type: 'string', required: true },
                    { name: 'testData', type: 'object', required: true }
                ],
                riskLevel: 'low',
                requiredPermissions: ['read', 'compute']
            }
        ];
        
        // Register tools
        for (const tool of tools) {
            this.registerTool(tool);
        }
        
        console.log(`📚 Loaded ${this.availableTools.size} tools in registry`);
    }
    
    /**
     * 📝 REGISTER TOOL
     */
    registerTool(tool) {
        this.availableTools.set(tool.id, {
            ...tool,
            isAvailable: true,
            lastUsed: null,
            successRate: 1.0,
            totalExecutions: 0,
            successfulExecutions: 0
        });
        
        // Add to category
        const category = this.toolCategories.get(tool.category) || [];
        category.push(tool.id);
        this.toolCategories.set(tool.category, category);
    }
    
    /**
     * 🔗 LOAD TOOL CHAINS
     */
    async loadToolChains() {
        try {
            const result = await this.dbPool.query(
                'SELECT * FROM tool_chains ORDER BY created_at DESC'
            );
            
            for (const row of result.rows) {
                this.toolChains.set(row.id, {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    tools: row.tools,
                    sequence: row.sequence,
                    parameters: row.parameters,
                    createdBy: row.created_by,
                    createdAt: row.created_at
                });
            }
            
            console.log(`🔗 Loaded ${this.toolChains.size} tool chains`);
        } catch (error) {
            console.error('Error loading tool chains:', error);
        }
    }
    
    /**
     * 🎯 SETUP DEFAULT INTERVENTION POINTS
     */
    async setupDefaultInterventionPoints() {
        // Set intervention points for critical tools
        for (const toolId of this.config.criticalTools) {
            this.setInterventionPoint(toolId, {
                pauseBeforeExecution: true,
                requireApproval: true,
                allowOverride: true,
                notifyOnExecution: true
            });
        }
    }
    
    /**
     * 🎯 ENHANCE EXECUTOR WITH TOOL CONTROL
     */
    enhanceExecutor(executor) {
        const executorId = executor.id || executor.agentId || `executor_${uuidv4()}`;
        
        console.log(`🎯 Enhancing executor ${executorId} with tool control`);
        
        // Initialize executor tracking
        this.executionHistory.set(executorId, []);
        this.rollbackStack.set(executorId, []);
        
        // Wrap execution methods
        this.wrapExecutionMethods(executor, executorId);
        
        // Add control methods
        this.addControlMethods(executor, executorId);
        
        return executor;
    }
    
    /**
     * 🔧 WRAP EXECUTION METHODS
     */
    wrapExecutionMethods(executor, executorId) {
        const executionMethods = [
            'execute', 'run', 'executeTool', 'runTool',
            'performAction', 'takeAction'
        ];
        
        executionMethods.forEach(methodName => {
            const originalMethod = executor[methodName];
            if (typeof originalMethod === 'function') {
                executor[methodName] = async (toolId, ...args) => {
                    return await this.controlledExecution(
                        executorId,
                        toolId,
                        originalMethod.bind(executor),
                        args
                    );
                };
            }
        });
    }
    
    /**
     * 🎛️ ADD CONTROL METHODS
     */
    addControlMethods(executor, executorId) {
        // Pause execution
        executor.pause = () => {
            this.pauseExecution(executorId);
        };
        
        // Resume execution
        executor.resume = () => {
            this.resumeExecution(executorId);
        };
        
        // Set breakpoint
        executor.setBreakpoint = (toolId) => {
            this.setBreakpoint(executorId, toolId);
        };
        
        // Clear breakpoint
        executor.clearBreakpoint = (toolId) => {
            this.clearBreakpoint(executorId, toolId);
        };
        
        // Rollback last action
        executor.rollback = async () => {
            return await this.rollbackLastAction(executorId);
        };
    }
    
    /**
     * 🎮 CONTROLLED EXECUTION
     */
    async controlledExecution(executorId, toolId, originalMethod, args) {
        const executionId = uuidv4();
        const startTime = performance.now();
        
        // Create execution record
        const executionRecord = {
            id: executionId,
            executorId,
            toolId,
            parameters: args,
            status: 'pending',
            startTime: new Date()
        };
        
        try {
            // Check for tool override
            const overriddenTool = await this.checkToolOverride(executorId, toolId);
            if (overriddenTool) {
                toolId = overriddenTool;
                executionRecord.overridden = true;
                executionRecord.originalTool = executionRecord.toolId;
                executionRecord.toolId = overriddenTool;
            }
            
            // Check for breakpoint
            if (this.hasBreakpoint(executorId, toolId)) {
                await this.handleBreakpoint(executorId, toolId, executionRecord);
            }
            
            // Check for intervention point
            const interventionPoint = this.interventionPoints.get(toolId);
            if (interventionPoint) {
                await this.handleInterventionPoint(
                    executorId,
                    toolId,
                    executionRecord,
                    interventionPoint
                );
            }
            
            // Check if paused
            if (this.pausedExecutions.has(executorId)) {
                await this.waitForResume(executorId);
            }
            
            // Check for pre-execution approval
            if (interventionPoint?.requireApproval || this.requiresApproval(toolId)) {
                const approved = await this.requestApproval(
                    executorId,
                    toolId,
                    executionRecord
                );
                
                if (!approved) {
                    executionRecord.status = 'rejected';
                    this.metrics.rejectedExecutions++;
                    
                    this.emit('execution:rejected', {
                        executorId,
                        toolId,
                        executionId,
                        reason: 'Human rejected execution'
                    });
                    
                    throw new Error('Execution rejected by human approval');
                }
                
                this.metrics.approvedExecutions++;
            }
            
            // Emit execution start
            this.emit('execution:start', {
                executorId,
                toolId,
                executionId,
                parameters: args,
                timestamp: new Date()
            });
            
            // Execute tool
            const result = await originalMethod(toolId, ...args);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Update execution record
            executionRecord.endTime = new Date();
            executionRecord.duration = duration;
            executionRecord.result = result;
            executionRecord.status = 'completed';
            
            // Add to history
            this.addToExecutionHistory(executorId, executionRecord);
            
            // Add to rollback stack
            if (this.config.enableRollback) {
                this.addToRollbackStack(executorId, executionRecord);
            }
            
            // Update tool statistics
            this.updateToolStatistics(toolId, true, duration);
            
            // Update metrics
            this.metrics.totalToolExecutions++;
            
            // Emit execution complete
            this.emit('execution:complete', {
                executorId,
                toolId,
                executionId,
                result,
                duration,
                timestamp: executionRecord.endTime
            });
            
            return result;
            
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            executionRecord.endTime = new Date();
            executionRecord.duration = duration;
            executionRecord.error = error.message;
            executionRecord.status = 'failed';
            
            // Add to history
            this.addToExecutionHistory(executorId, executionRecord);
            
            // Update tool statistics
            this.updateToolStatistics(toolId, false, duration);
            
            // Emit execution error
            this.emit('execution:error', {
                executorId,
                toolId,
                executionId,
                error: error.message,
                duration,
                timestamp: executionRecord.endTime
            });
            
            throw error;
        }
    }
    
    /**
     * 🔄 CHECK TOOL OVERRIDE
     */
    async checkToolOverride(executorId, toolId) {
        const override = this.toolOverrides.get(`${executorId}:${toolId}`);
        
        if (override && override.active) {
            console.log(`🔄 Tool override: ${toolId} -> ${override.newTool}`);
            
            this.metrics.overriddenTools++;
            
            this.emit('tool:overridden', {
                executorId,
                originalTool: toolId,
                newTool: override.newTool,
                reason: override.reason
            });
            
            return override.newTool;
        }
        
        return null;
    }
    
    /**
     * 🛑 HANDLE BREAKPOINT
     */
    async handleBreakpoint(executorId, toolId, executionRecord) {
        console.log(`🛑 Breakpoint hit: ${toolId}`);
        
        this.emit('breakpoint:hit', {
            executorId,
            toolId,
            execution: executionRecord
        });
        
        // Start step-through session
        const sessionId = uuidv4();
        this.stepThroughSessions.set(sessionId, {
            executorId,
            toolId,
            executionRecord,
            status: 'paused',
            continuePromise: null
        });
        
        // Wait for continue signal
        await this.waitForStepContinue(sessionId);
    }
    
    /**
     * 🎯 HANDLE INTERVENTION POINT
     */
    async handleInterventionPoint(executorId, toolId, executionRecord, interventionPoint) {
        if (interventionPoint.pauseBeforeExecution) {
            console.log(`⏸️ Pausing before execution: ${toolId}`);
            
            this.emit('intervention:pause', {
                executorId,
                toolId,
                execution: executionRecord,
                interventionPoint
            });
            
            // Pause and wait
            this.pauseExecution(executorId);
            await this.waitForResume(executorId);
        }
        
        if (interventionPoint.notifyOnExecution) {
            this.emit('intervention:notify', {
                executorId,
                toolId,
                execution: executionRecord
            });
        }
    }
    
    /**
     * ✅ REQUEST APPROVAL
     */
    async requestApproval(executorId, toolId, executionRecord) {
        const approvalId = uuidv4();
        
        const approvalRequest = {
            id: approvalId,
            executorId,
            toolId,
            executionRecord,
            requestedAt: new Date(),
            status: 'pending',
            decision: null,
            decidedBy: null,
            decidedAt: null
        };
        
        this.pendingApprovals.set(approvalId, approvalRequest);
        
        // Emit approval request
        this.emit('approval:requested', {
            approvalId,
            executorId,
            toolId,
            tool: this.availableTools.get(toolId),
            parameters: executionRecord.parameters,
            riskLevel: this.availableTools.get(toolId)?.riskLevel || 'unknown'
        });
        
        // Wait for approval with timeout
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                approvalRequest.status = 'timeout';
                this.pendingApprovals.delete(approvalId);
                
                this.emit('approval:timeout', { approvalId });
                
                resolve(false); // Default to rejection on timeout
            }, this.config.approvalTimeout);
            
            // Store resolver for later
            approvalRequest.resolver = (approved) => {
                clearTimeout(timeout);
                resolve(approved);
            };
        });
    }
    
    /**
     * ✅ APPROVE EXECUTION
     */
    approveExecution(approvalId, decidedBy = 'human', feedback = null) {
        const approval = this.pendingApprovals.get(approvalId);
        
        if (!approval || approval.status !== 'pending') {
            return false;
        }
        
        approval.status = 'approved';
        approval.decision = 'approve';
        approval.decidedBy = decidedBy;
        approval.decidedAt = new Date();
        approval.feedback = feedback;
        
        // Update approval time metrics
        const approvalTime = approval.decidedAt - approval.requestedAt;
        this.updateApprovalTimeMetrics(approvalTime);
        
        // Resolve promise
        if (approval.resolver) {
            approval.resolver(true);
        }
        
        this.pendingApprovals.delete(approvalId);
        
        // Emit approval
        this.emit('approval:granted', {
            approvalId,
            executorId: approval.executorId,
            toolId: approval.toolId,
            decidedBy,
            feedback
        });
        
        // Store in database
        this.storeApprovalDecision(approval);
        
        return true;
    }
    
    /**
     * ❌ REJECT EXECUTION
     */
    rejectExecution(approvalId, decidedBy = 'human', reason = null) {
        const approval = this.pendingApprovals.get(approvalId);
        
        if (!approval || approval.status !== 'pending') {
            return false;
        }
        
        approval.status = 'rejected';
        approval.decision = 'reject';
        approval.decidedBy = decidedBy;
        approval.decidedAt = new Date();
        approval.reason = reason;
        
        // Resolve promise
        if (approval.resolver) {
            approval.resolver(false);
        }
        
        this.pendingApprovals.delete(approvalId);
        
        // Emit rejection
        this.emit('approval:rejected', {
            approvalId,
            executorId: approval.executorId,
            toolId: approval.toolId,
            decidedBy,
            reason
        });
        
        // Store in database
        this.storeApprovalDecision(approval);
        
        return true;
    }
    
    /**
     * 🔄 OVERRIDE TOOL
     */
    overrideTool(executorId, originalTool, newTool, reason = null) {
        const overrideKey = `${executorId}:${originalTool}`;
        
        this.toolOverrides.set(overrideKey, {
            executorId,
            originalTool,
            newTool,
            reason,
            active: true,
            createdAt: new Date()
        });
        
        // Emit override event
        this.emit('tool:override:set', {
            executorId,
            originalTool,
            newTool,
            reason
        });
        
        // Store in database
        this.storeToolOverride(executorId, originalTool, newTool, reason);
        
        return true;
    }
    
    /**
     * 🔗 CREATE TOOL CHAIN
     */
    async createToolChain(name, description, tools, sequence, parameters = {}) {
        const chainId = uuidv4();
        
        const toolChain = {
            id: chainId,
            name,
            description,
            tools,
            sequence,
            parameters,
            createdBy: 'human',
            createdAt: new Date()
        };
        
        this.toolChains.set(chainId, toolChain);
        
        // Store in database
        await this.storeToolChain(toolChain);
        
        // Emit creation event
        this.emit('toolchain:created', toolChain);
        
        return toolChain;
    }
    
    /**
     * ▶️ EXECUTE TOOL CHAIN
     */
    async executeToolChain(chainId, executor, initialParams = {}) {
        const chain = this.toolChains.get(chainId);
        
        if (!chain) {
            throw new Error(`Tool chain ${chainId} not found`);
        }
        
        const executionId = uuidv4();
        const results = [];
        
        // Emit chain execution start
        this.emit('toolchain:start', {
            chainId,
            executionId,
            chain,
            initialParams
        });
        
        let currentParams = { ...initialParams, ...chain.parameters };
        
        for (const toolId of chain.sequence) {
            try {
                // Execute tool with current parameters
                const result = await executor.execute(toolId, currentParams);
                
                results.push({
                    toolId,
                    result,
                    success: true
                });
                
                // Pass result as input to next tool
                currentParams = {
                    ...currentParams,
                    previousResult: result
                };
                
            } catch (error) {
                results.push({
                    toolId,
                    error: error.message,
                    success: false
                });
                
                // Emit chain error
                this.emit('toolchain:error', {
                    chainId,
                    executionId,
                    toolId,
                    error: error.message
                });
                
                // Stop chain on error
                break;
            }
        }
        
        // Emit chain complete
        this.emit('toolchain:complete', {
            chainId,
            executionId,
            results
        });
        
        return results;
    }
    
    /**
     * ⏸️ PAUSE EXECUTION
     */
    pauseExecution(executorId) {
        if (!this.pausedExecutions.has(executorId)) {
            this.pausedExecutions.set(executorId, {
                pausedAt: new Date(),
                resumePromise: null
            });
            
            this.emit('execution:paused', { executorId });
        }
    }
    
    /**
     * ▶️ RESUME EXECUTION
     */
    resumeExecution(executorId) {
        const pauseInfo = this.pausedExecutions.get(executorId);
        
        if (pauseInfo && pauseInfo.resumePromise) {
            pauseInfo.resumePromise.resolve();
            this.pausedExecutions.delete(executorId);
            
            this.emit('execution:resumed', { executorId });
        }
    }
    
    /**
     * ⏳ WAIT FOR RESUME
     */
    async waitForResume(executorId) {
        const pauseInfo = this.pausedExecutions.get(executorId);
        
        if (!pauseInfo) return;
        
        return new Promise((resolve) => {
            pauseInfo.resumePromise = { resolve };
        });
    }
    
    /**
     * ↩️ ROLLBACK LAST ACTION
     */
    async rollbackLastAction(executorId) {
        const rollbackStack = this.rollbackStack.get(executorId) || [];
        
        if (rollbackStack.length === 0) {
            return { success: false, reason: 'No actions to rollback' };
        }
        
        const lastAction = rollbackStack.pop();
        
        try {
            // Determine rollback strategy based on tool
            const rollbackResult = await this.executeRollback(lastAction);
            
            this.metrics.rollbacks++;
            
            // Emit rollback event
            this.emit('execution:rollback', {
                executorId,
                action: lastAction,
                result: rollbackResult
            });
            
            return {
                success: true,
                rolledBack: lastAction,
                result: rollbackResult
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 🔄 EXECUTE ROLLBACK
     */
    async executeRollback(action) {
        const tool = this.availableTools.get(action.toolId);
        
        if (!tool) {
            throw new Error(`Cannot rollback: tool ${action.toolId} not found`);
        }
        
        // Tool-specific rollback strategies
        switch (tool.category) {
            case 'data':
                if (action.toolId === 'modify_data') {
                    // Restore previous data state if available
                    return { method: 'restore', restored: true };
                }
                break;
                
            case 'execution':
                if (action.toolId === 'execute_trade') {
                    // Create reverse trade
                    return { method: 'reverse_trade', reversed: true };
                }
                break;
                
            default:
                // Generic rollback - mark as undone
                return { method: 'mark_undone', undone: true };
        }
        
        return { method: 'none', message: 'No rollback available for this tool' };
    }
    
    /**
     * 📊 UPDATE TOOL STATISTICS
     */
    updateToolStatistics(toolId, success, duration) {
        const tool = this.availableTools.get(toolId);
        
        if (!tool) return;
        
        tool.totalExecutions++;
        tool.lastUsed = new Date();
        
        if (success) {
            tool.successfulExecutions++;
        }
        
        tool.successRate = tool.successfulExecutions / tool.totalExecutions;
    }
    
    /**
     * 📊 UPDATE APPROVAL TIME METRICS
     */
    updateApprovalTimeMetrics(approvalTime) {
        const currentAvg = this.metrics.averageApprovalTime;
        const totalApprovals = this.metrics.approvedExecutions + this.metrics.rejectedExecutions;
        
        this.metrics.averageApprovalTime = 
            (currentAvg * (totalApprovals - 1) + approvalTime) / totalApprovals;
    }
    
    /**
     * 💾 ADD TO EXECUTION HISTORY
     */
    addToExecutionHistory(executorId, execution) {
        const history = this.executionHistory.get(executorId) || [];
        history.push(execution);
        
        // Limit history size
        if (history.length > 1000) {
            history.shift();
        }
        
        this.executionHistory.set(executorId, history);
        
        // Store in database
        this.storeExecutionHistory(execution);
    }
    
    /**
     * 💾 ADD TO ROLLBACK STACK
     */
    addToRollbackStack(executorId, execution) {
        const stack = this.rollbackStack.get(executorId) || [];
        stack.push(execution);
        
        // Limit stack size
        if (stack.length > this.config.maxRollbackSteps) {
            stack.shift();
        }
        
        this.rollbackStack.set(executorId, stack);
    }
    
    /**
     * 🎯 SET INTERVENTION POINT
     */
    setInterventionPoint(toolId, settings) {
        this.interventionPoints.set(toolId, settings);
    }
    
    /**
     * 🛑 SET BREAKPOINT
     */
    setBreakpoint(executorId, toolId) {
        const key = `${executorId}:${toolId}`;
        this.breakpoints.set(key, true);
    }
    
    /**
     * 🛑 CLEAR BREAKPOINT
     */
    clearBreakpoint(executorId, toolId) {
        const key = `${executorId}:${toolId}`;
        this.breakpoints.delete(key);
    }
    
    /**
     * 🛑 HAS BREAKPOINT
     */
    hasBreakpoint(executorId, toolId) {
        const key = `${executorId}:${toolId}`;
        return this.breakpoints.has(key);
    }
    
    /**
     * ✅ REQUIRES APPROVAL
     */
    requiresApproval(toolId) {
        const tool = this.availableTools.get(toolId);
        return tool && (tool.riskLevel === 'critical' || tool.riskLevel === 'high');
    }
    
    /**
     * 🏗️ CREATE TOOL CONTROL TABLES
     */
    async createToolControlTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS tool_executions (
                id VARCHAR(100) PRIMARY KEY,
                executor_id VARCHAR(200) NOT NULL,
                tool_id VARCHAR(200) NOT NULL,
                parameters JSONB,
                result JSONB,
                error TEXT,
                duration FLOAT,
                status VARCHAR(50),
                overridden BOOLEAN DEFAULT FALSE,
                original_tool VARCHAR(200),
                start_time TIMESTAMPTZ,
                end_time TIMESTAMPTZ,
                INDEX idx_tool_exec_executor (executor_id),
                INDEX idx_tool_exec_tool (tool_id),
                INDEX idx_tool_exec_time (start_time DESC)
            )`,
            
            `CREATE TABLE IF NOT EXISTS tool_approvals (
                id VARCHAR(100) PRIMARY KEY,
                executor_id VARCHAR(200) NOT NULL,
                tool_id VARCHAR(200) NOT NULL,
                status VARCHAR(50),
                decision VARCHAR(50),
                decided_by VARCHAR(200),
                reason TEXT,
                feedback TEXT,
                requested_at TIMESTAMPTZ,
                decided_at TIMESTAMPTZ,
                INDEX idx_approval_executor (executor_id),
                INDEX idx_approval_status (status)
            )`,
            
            `CREATE TABLE IF NOT EXISTS tool_overrides_history (
                id SERIAL PRIMARY KEY,
                executor_id VARCHAR(200) NOT NULL,
                original_tool VARCHAR(200) NOT NULL,
                new_tool VARCHAR(200) NOT NULL,
                reason TEXT,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                INDEX idx_override_executor (executor_id)
            )`,
            
            `CREATE TABLE IF NOT EXISTS tool_chains_db (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(200) UNIQUE NOT NULL,
                description TEXT,
                tools JSONB NOT NULL,
                sequence JSONB NOT NULL,
                parameters JSONB,
                created_by VARCHAR(200),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )`
        ];
        
        for (const query of queries) {
            try {
                await this.dbPool.query(query);
            } catch (error) {
                console.error('Error creating tool control table:', error);
            }
        }
    }
    
    /**
     * 📈 GET METRICS
     */
    getMetrics() {
        return {
            ...this.metrics,
            availableTools: this.availableTools.size,
            activeOverrides: this.toolOverrides.size,
            toolChains: this.toolChains.size,
            pendingApprovals: this.pendingApprovals.size,
            pausedExecutions: this.pausedExecutions.size,
            activeBreakpoints: this.breakpoints.size
        };
    }
}

// Export singleton instance
const toolControlGateway = new ToolControlGateway();
export { toolControlGateway };
export default toolControlGateway;
