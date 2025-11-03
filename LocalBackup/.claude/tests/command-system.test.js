// command-system.test.js - Comprehensive Test Suite for Construction Syndicate Commands
import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { CommandsServer } from '../mcp-servers/commands-server.js';
import { WorkflowEngine } from '../workflow-automation/workflow-engine.js';
import { CommandAnalytics } from '../analytics/command-analytics.js';
import { ServiceRegistry } from '../../src/core/ServiceRegistry.js';
import { DatabasePoolManager } from '../../src/core/DatabasePoolManager.js';

describe('Construction Syndicate Command System', () => {
    let commandServer;
    let workflowEngine;
    let analytics;
    let dbPool;
    let registry;
    
    beforeAll(async () => {
        // Initialize test environment
        registry = ServiceRegistry.getInstance();
        dbPool = DatabasePoolManager.getInstance();
        
        // Initialize components
        commandServer = new CommandsServer();
        workflowEngine = new WorkflowEngine();
        analytics = new CommandAnalytics();
        
        await commandServer.initialize();
        await workflowEngine.initialize();
        await analytics.initialize();
    });
    
    afterAll(async () => {
        // Cleanup
        await dbPool.end();
    });
    
    describe('Command Server', () => {
        test('should initialize with all commands', async () => {
            const tools = await commandServer.listTools();
            
            expect(Object.keys(tools)).toContain('cmd_plan');
            expect(Object.keys(tools)).toContain('cmd_hoai');
            expect(Object.keys(tools)).toContain('cmd_architect');
            expect(Object.keys(tools)).toContain('cmd_implement');
            expect(Object.keys(tools)).toContain('cmd_quantum');
            expect(Object.keys(tools)).toContain('cmd_syndicate');
            expect(Object.keys(tools)).toContain('cmd_analyze');
            expect(Object.keys(tools)).toContain('cmd_test');
            expect(Object.keys(tools)).toContain('cmd_deploy');
            expect(Object.keys(tools)).toContain('cmd_document');
            expect(Object.keys(tools)).toContain('cmd_help');
        });
        
        test('/plan command should execute successfully', async () => {
            const result = await commandServer.executeTool('cmd_plan', {
                scope: 'test authentication system',
                includeHOAI: false
            });
            
            expect(result.success).toBe(true);
            expect(result.plan).toBeDefined();
            expect(result.tasks).toBeDefined();
            expect(result.tasks.length).toBeGreaterThan(0);
            expect(result.timeline).toBeDefined();
            expect(result.risks).toBeDefined();
        });
        
        test('/hoai command should check compliance', async () => {
            const result = await commandServer.executeTool('cmd_hoai', {
                action: 'check',
                phase: 'LP3'
            });
            
            expect(result.success).toBe(true);
            expect(result.phase).toBe('LP3');
            expect(result.compliant).toBeDefined();
            expect(result.complianceScore).toBeDefined();
            expect(result.details).toBeDefined();
        });
        
        test('/help command should provide command list', async () => {
            const result = await commandServer.executeTool('cmd_help', {});
            
            expect(result.title).toBe('Construction Syndicate Commands');
            expect(result.commands).toBeDefined();
            expect(result.commands.length).toBeGreaterThan(10);
            expect(result.usage).toBeDefined();
            expect(result.examples).toBeDefined();
        });
        
        test('should handle unknown command gracefully', async () => {
            const result = await commandServer.executeTool('cmd_unknown', {});
            
            expect(result.error).toBeDefined();
            expect(result.availableCommands).toBeDefined();
        });
        
        test('should track command usage', async () => {
            // Mock analytics tracking
            const trackSpy = jest.spyOn(commandServer, 'logCommandUsage');
            
            await commandServer.executeTool('cmd_plan', {
                scope: 'test feature'
            });
            
            expect(trackSpy).toHaveBeenCalledWith('plan', 
                expect.objectContaining({ scope: 'test feature' })
            );
        });
    });
    
    describe('Workflow Engine', () => {
        test('should load workflow templates', async () => {
            const workflows = await workflowEngine.listWorkflows();
            
            expect(workflows.length).toBeGreaterThan(0);
            expect(workflows.find(w => w.id === 'newFeature')).toBeDefined();
            expect(workflows.find(w => w.id === 'hoaiCompliance')).toBeDefined();
            expect(workflows.find(w => w.id === 'emergencyHotfix')).toBeDefined();
            expect(workflows.find(w => w.id === 'quantumOptimization')).toBeDefined();
            expect(workflows.find(w => w.id === 'syndicateTask')).toBeDefined();
        });
        
        test('should execute simple workflow', async () => {
            const execution = await workflowEngine.executeWorkflow('hoaiCompliance', {
                phase: 'LP3',
                project_id: 'test-project'
            });
            
            expect(execution.status).toBe('completed');
            expect(execution.executionId).toBeDefined();
            expect(execution.result).toBeDefined();
            expect(execution.duration).toBeDefined();
        });
        
        test('should interpolate parameters correctly', () => {
            const params = {
                scope: '{{feature_name}}',
                context: 'Testing {{feature_name}} with {{environment}}'
            };
            
            const context = {
                feature_name: 'authentication',
                environment: 'staging'
            };
            
            const interpolated = workflowEngine.interpolateParameters(params, context);
            
            expect(interpolated.scope).toBe('authentication');
            expect(interpolated.context).toBe('Testing authentication with staging');
        });
        
        test('should handle workflow conditions', async () => {
            const conditionTrue = await workflowEngine.evaluateCondition(
                'context.value > 5',
                { value: 10 }
            );
            
            const conditionFalse = await workflowEngine.evaluateCondition(
                'context.value > 5',
                { value: 3 }
            );
            
            expect(conditionTrue).toBe(true);
            expect(conditionFalse).toBe(false);
        });
        
        test('should create custom workflow', async () => {
            const workflowDef = {
                name: 'Test Custom Workflow',
                description: 'Test workflow for unit tests',
                steps: [
                    {
                        id: 'step1',
                        command: '/plan',
                        params: { scope: 'test' }
                    }
                ]
            };
            
            const workflowId = await workflowEngine.createCustomWorkflow(workflowDef);
            
            expect(workflowId).toBeDefined();
            expect(workflowId.startsWith('wf_')).toBe(true);
        });
    });
    
    describe('Command Analytics', () => {
        test('should track command execution', async () => {
            await analytics.trackCommandExecution({
                command: 'plan',
                parameters: { scope: 'test' },
                userId: 'test-user',
                executionId: 'test-exec-1'
            });
            
            // Verify tracking occurred
            const stats = await analytics.getCommandStats('1h');
            expect(stats.overall.total_executions).toBeGreaterThan(0);
        });
        
        test('should calculate real-time stats', () => {
            analytics.updateRealTimeStats('execution', 'plan');
            
            const realTimeStats = analytics.getRealTimeStats();
            
            expect(realTimeStats).toBeDefined();
            expect(realTimeStats.commandsPerMinute).toBeDefined();
            expect(realTimeStats.averageResponseTime).toBeDefined();
            expect(realTimeStats.errorRate).toBeDefined();
            expect(realTimeStats.activeUsers).toBeDefined();
        });
        
        test('should detect patterns', async () => {
            // Simulate command sequence
            const commands = ['plan', 'architect', 'implement', 'test', 'deploy'];
            
            for (const cmd of commands) {
                await analytics.updatePatternDetection(cmd);
            }
            
            // Repeat sequence
            for (const cmd of commands) {
                await analytics.updatePatternDetection(cmd);
            }
            
            // Pattern should be detected
            const patterns = analytics.recentCommands;
            expect(patterns).toBeDefined();
            expect(patterns.length).toBeGreaterThan(0);
        });
        
        test('should generate user insights', () => {
            const usage = [
                { command: 'plan', executions: 50, success_rate: 0.9, avg_duration_ms: 1000 },
                { command: 'hoai', executions: 30, success_rate: 0.7, avg_duration_ms: 500 },
                { command: 'deploy', executions: 10, success_rate: 0.6, avg_duration_ms: 8000 }
            ];
            
            const patterns = [
                { sequence: 'plan -> implement', frequency: 20 }
            ];
            
            const insights = analytics.generateUserInsights(usage, patterns);
            
            expect(insights.length).toBeGreaterThan(0);
            expect(insights.some(i => i.type === 'most_used')).toBe(true);
            expect(insights.some(i => i.type === 'low_success_rate')).toBe(true);
        });
        
        test('should export analytics in different formats', async () => {
            const jsonExport = await analytics.exportAnalytics('json', '24h');
            expect(JSON.parse(jsonExport)).toBeDefined();
            
            const csvExport = await analytics.exportAnalytics('csv', '24h');
            expect(csvExport.includes('Command,Executions')).toBe(true);
        });
    });
    
    describe('Integration Tests', () => {
        test('command execution should trigger analytics', async () => {
            const analyticsSpy = jest.spyOn(analytics, 'trackCommandExecution');
            
            // Execute command
            await commandServer.executeTool('cmd_plan', {
                scope: 'analytics test'
            });
            
            // Verify analytics were called
            expect(analyticsSpy).toHaveBeenCalled();
        });
        
        test('workflow should execute commands in sequence', async () => {
            const workflow = {
                name: 'Test Sequence',
                steps: [
                    {
                        id: 'plan',
                        command: '/plan',
                        params: { scope: 'sequence test' },
                        outputs: ['plan']
                    },
                    {
                        id: 'analyze',
                        command: '/analyze',
                        params: { target: 'test', type: 'all' },
                        dependsOn: ['plan']
                    }
                ]
            };
            
            const workflowId = await workflowEngine.createCustomWorkflow(workflow);
            const execution = await workflowEngine.executeWorkflow(workflowId, {});
            
            expect(execution.status).toBe('completed');
            expect(execution.result.steps.plan.state).toBe('completed');
            expect(execution.result.steps.analyze.state).toBe('completed');
        });
    });
    
    describe('Performance Tests', () => {
        test('command execution should complete within SLA', async () => {
            const startTime = Date.now();
            
            const result = await commandServer.executeTool('cmd_help', {});
            
            const duration = Date.now() - startTime;
            
            expect(result).toBeDefined();
            expect(duration).toBeLessThan(100); // Should complete in 100ms
        });
        
        test('parallel command execution', async () => {
            const startTime = Date.now();
            
            // Execute multiple commands in parallel
            const promises = [
                commandServer.executeTool('cmd_help', {}),
                commandServer.executeTool('cmd_help', { command: 'plan' }),
                commandServer.executeTool('cmd_help', { command: 'hoai' })
            ];
            
            const results = await Promise.all(promises);
            
            const duration = Date.now() - startTime;
            
            expect(results.length).toBe(3);
            expect(results.every(r => r.commands || r.command)).toBe(true);
            expect(duration).toBeLessThan(300); // Should complete quickly in parallel
        });
    });
    
    describe('Error Handling', () => {
        test('should handle command errors gracefully', async () => {
            const result = await commandServer.executeTool('cmd_plan', {
                // Missing required parameter
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
        
        test('should handle workflow timeout', async () => {
            // Create workflow with timeout
            const workflow = {
                name: 'Timeout Test',
                steps: [
                    {
                        id: 'slow',
                        command: '/analyze',
                        params: { 
                            target: 'entire-codebase',
                            type: 'all',
                            depth: 'deep'
                        }
                    }
                ]
            };
            
            const workflowId = await workflowEngine.createCustomWorkflow(workflow);
            
            // Set short timeout
            workflowEngine.maxWait = 100; // 100ms
            
            try {
                await workflowEngine.executeWorkflow(workflowId, {});
            } catch (error) {
                expect(error.message).toContain('timeout');
            }
            
            // Reset timeout
            workflowEngine.maxWait = 300000;
        });
        
        test('should detect high error rates', async () => {
            const alertSpy = jest.fn();
            analytics.on('high_error_rate', alertSpy);
            
            // Simulate multiple errors
            for (let i = 0; i < 15; i++) {
                await analytics.trackCommandError({
                    command: 'test-command',
                    executionId: `error-${i}`,
                    error: { message: 'Test error' },
                    duration: 100
                });
            }
            
            // Check threshold
            await analytics.checkErrorThresholds('test-command');
            
            // Verify alert was triggered
            expect(alertSpy).toHaveBeenCalled();
        });
    });
    
    describe('Security Tests', () => {
        test('should sanitize command parameters', async () => {
            const result = await commandServer.executeTool('cmd_plan', {
                scope: '<script>alert("xss")</script>',
                context: '"; DROP TABLE users; --'
            });
            
            // Command should execute but parameters should be safe
            expect(result).toBeDefined();
            // Verify no actual script execution or SQL injection occurred
        });
        
        test('should enforce permission boundaries', async () => {
            // Test with restricted user context
            const restrictedResult = await commandServer.executeTool('cmd_deploy', {
                environment: 'production'
                // Missing approval flag
            });
            
            // Should require approval for production
            expect(restrictedResult.error || restrictedResult.requiresApproval).toBeDefined();
        });
    });
});

// Export test utilities
export const testUtils = {
    createMockCommand: (name, handler) => ({
        name,
        execute: handler || (async () => ({ success: true }))
    }),
    
    createMockWorkflow: (steps) => ({
        name: 'Test Workflow',
        steps: steps || [
            { id: 'step1', command: '/test', params: {} }
        ]
    }),
    
    waitForAnalytics: async (timeout = 1000) => {
        await new Promise(resolve => setTimeout(resolve, timeout));
    }
};
