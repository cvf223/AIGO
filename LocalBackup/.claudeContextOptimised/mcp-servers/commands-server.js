// commands-server.js - MCP Server for Construction Syndicate Commands
import { ServiceRegistry } from '../../src/core/ServiceRegistry.js';
import { ZAPEngine } from '../../src/agents/planning/ZAPEngine.js';
import { DatabasePoolManager } from '../../src/core/DatabasePoolManager.js';

export class CommandsServer {
    constructor() {
        this.name = 'construction-commands';
        this.version = '1.0.0';
        this.description = 'MCP Server providing Construction Syndicate slash commands';
        
        this.registry = ServiceRegistry.getInstance();
        this.dbPool = DatabasePoolManager.getInstance();
        this.commands = new Map();
        
        this.initializeCommands();
    }
    
    async initialize() {
        console.log('Initializing Construction Commands MCP Server...');
        
        // Register with service registry
        await this.registry.register('CommandsServer', this);
        
        // Load command implementations
        await this.loadCommands();
        
        // Start command analytics
        this.startAnalytics();
        
        console.log(`Commands Server initialized with ${this.commands.size} commands`);
    }
    
    initializeCommands() {
        // Command definitions
        this.commandDefinitions = {
            plan: {
                description: 'Create strategic plans using ZAP Engine',
                parameters: {
                    type: 'object',
                    properties: {
                        scope: { 
                            type: 'string', 
                            description: 'What to plan'
                        },
                        context: { 
                            type: 'string', 
                            description: 'Additional context'
                        },
                        timeframe: {
                            type: 'string',
                            description: 'Target timeframe',
                            default: 'flexible'
                        },
                        includeHOAI: {
                            type: 'boolean',
                            description: 'Include HOAI compliance',
                            default: true
                        }
                    },
                    required: ['scope']
                }
            },
            
            hoai: {
                description: 'HOAI compliance checking and calculations',
                parameters: {
                    type: 'object',
                    properties: {
                        action: {
                            type: 'string',
                            enum: ['check', 'calculate', 'validate', 'report'],
                            description: 'Action to perform'
                        },
                        phase: {
                            type: 'string',
                            pattern: '^LP[1-9]$',
                            description: 'HOAI phase'
                        },
                        projectId: {
                            type: 'string',
                            description: 'Project identifier'
                        }
                    },
                    required: ['action']
                }
            },
            
            architect: {
                description: 'Create system architecture designs',
                parameters: {
                    type: 'object',
                    properties: {
                        system: {
                            type: 'string',
                            description: 'System to architect'
                        },
                        style: {
                            type: 'string',
                            enum: ['microservices', 'monolithic', 'serverless', 'hybrid'],
                            default: 'microservices'
                        },
                        includeDiagram: {
                            type: 'boolean',
                            default: true
                        }
                    },
                    required: ['system']
                }
            },
            
            implement: {
                description: 'Generate production-ready code',
                parameters: {
                    type: 'object',
                    properties: {
                        feature: {
                            type: 'string',
                            description: 'Feature to implement'
                        },
                        withTests: {
                            type: 'boolean',
                            default: true
                        },
                        testCoverage: {
                            type: 'number',
                            default: 80,
                            minimum: 0,
                            maximum: 100
                        },
                        style: {
                            type: 'string',
                            enum: ['functional', 'class-based', 'hybrid'],
                            default: 'class-based'
                        }
                    },
                    required: ['feature']
                }
            },
            
            quantum: {
                description: 'Apply quantum-inspired optimization',
                parameters: {
                    type: 'object',
                    properties: {
                        operation: {
                            type: 'string',
                            enum: ['optimize', 'enhance', 'analyze', 'simulate']
                        },
                        target: {
                            type: 'string',
                            description: 'What to optimize'
                        },
                        algorithm: {
                            type: 'string',
                            enum: ['annealing', 'vqe', 'qaoa', 'grover'],
                            default: 'annealing'
                        }
                    },
                    required: ['operation', 'target']
                }
            },
            
            syndicate: {
                description: 'Coordinate multi-agent tasks',
                parameters: {
                    type: 'object',
                    properties: {
                        task: {
                            type: 'string',
                            description: 'Task to coordinate'
                        },
                        agents: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Specific agents to involve'
                        },
                        strategy: {
                            type: 'string',
                            enum: ['parallel', 'sequential', 'consensus', 'hierarchical'],
                            default: 'parallel'
                        }
                    },
                    required: ['task']
                }
            },
            
            analyze: {
                description: 'Perform deep code analysis',
                parameters: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['security', 'performance', 'quality', 'dependencies', 'all'],
                            default: 'all'
                        },
                        target: {
                            type: 'string',
                            description: 'What to analyze (path or module)'
                        },
                        depth: {
                            type: 'string',
                            enum: ['shallow', 'normal', 'deep'],
                            default: 'normal'
                        }
                    },
                    required: ['target']
                }
            },
            
            test: {
                description: 'Generate and run tests',
                parameters: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['unit', 'integration', 'e2e', 'performance', 'security'],
                            default: 'unit'
                        },
                        target: {
                            type: 'string',
                            description: 'What to test'
                        },
                        coverage: {
                            type: 'number',
                            default: 80,
                            minimum: 0,
                            maximum: 100
                        }
                    },
                    required: ['target']
                }
            },
            
            deploy: {
                description: 'Execute deployment pipeline',
                parameters: {
                    type: 'object',
                    properties: {
                        environment: {
                            type: 'string',
                            enum: ['development', 'staging', 'production'],
                            default: 'staging'
                        },
                        strategy: {
                            type: 'string',
                            enum: ['blue-green', 'canary', 'rolling', 'direct'],
                            default: 'blue-green'
                        },
                        runMigrations: {
                            type: 'boolean',
                            default: true
                        },
                        runTests: {
                            type: 'boolean',
                            default: true
                        }
                    },
                    required: ['environment']
                }
            },
            
            document: {
                description: 'Generate documentation',
                parameters: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['api', 'architecture', 'user', 'developer', 'all'],
                            default: 'all'
                        },
                        target: {
                            type: 'string',
                            description: 'What to document'
                        },
                        format: {
                            type: 'string',
                            enum: ['markdown', 'html', 'pdf', 'docx'],
                            default: 'markdown'
                        },
                        includeExamples: {
                            type: 'boolean',
                            default: true
                        }
                    },
                    required: ['target']
                }
            },
            
            help: {
                description: 'Get help on commands',
                parameters: {
                    type: 'object',
                    properties: {
                        command: {
                            type: 'string',
                            description: 'Command to get help for'
                        },
                        detailed: {
                            type: 'boolean',
                            default: false
                        }
                    }
                }
            }
        };
    }
    
    async loadCommands() {
        // Dynamic import of command implementations
        const commandModules = {
            plan: () => import('../skills/planning-skills/plan-command/implementation.js'),
            hoai: () => import('../skills/compliance-skills/hoai-command/implementation.js'),
            architect: () => import('../skills/architecture-skills/architect-command/implementation.js'),
            implement: () => import('../skills/development-skills/implement-command/implementation.js'),
            quantum: () => import('../skills/quantum-skills/quantum-command/implementation.js'),
            syndicate: () => import('../skills/coordination-skills/syndicate-command/implementation.js'),
            analyze: () => import('../skills/analysis-skills/analyze-command/implementation.js'),
            test: () => import('../skills/testing-skills/test-command/implementation.js'),
            deploy: () => import('../skills/deployment-skills/deploy-command/implementation.js'),
            document: () => import('../skills/documentation-skills/document-command/implementation.js')
        };
        
        for (const [name, loader] of Object.entries(commandModules)) {
            try {
                const module = await loader();
                const CommandClass = module.default || module[Object.keys(module)[0]];
                const instance = new CommandClass();
                
                if (instance.initialize) {
                    await instance.initialize();
                }
                
                this.commands.set(name, instance);
                console.log(`✅ Loaded command: /${name}`);
            } catch (error) {
                console.warn(`⚠️  Command /${name} not yet implemented`);
                // Create placeholder
                this.commands.set(name, {
                    execute: async (params) => ({
                        success: false,
                        message: `Command /${name} is not yet implemented`,
                        suggestion: 'Use /help for available commands'
                    })
                });
            }
        }
        
        // Add help command
        this.commands.set('help', {
            execute: async (params) => this.getHelp(params)
        });
    }
    
    // MCP Server Interface
    
    async listTools() {
        const tools = {};
        
        for (const [name, definition] of Object.entries(this.commandDefinitions)) {
            tools[`cmd_${name}`] = {
                description: definition.description,
                inputSchema: definition.parameters
            };
        }
        
        return tools;
    }
    
    async executeTool(toolName, parameters) {
        // Extract command name from tool name (cmd_plan -> plan)
        const commandName = toolName.replace('cmd_', '');
        
        const command = this.commands.get(commandName);
        if (!command) {
            return {
                error: `Unknown command: ${commandName}`,
                availableCommands: Array.from(this.commands.keys())
            };
        }
        
        try {
            // Log command usage
            await this.logCommandUsage(commandName, parameters);
            
            // Execute command
            const startTime = Date.now();
            const result = await command.execute(parameters);
            const duration = Date.now() - startTime;
            
            // Log result
            await this.logCommandResult(commandName, result, duration);
            
            return result;
            
        } catch (error) {
            console.error(`Command execution failed: ${commandName}`, error);
            return {
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }
    
    // Help System
    
    async getHelp(params = {}) {
        const { command, detailed } = params;
        
        if (command) {
            // Get help for specific command
            const definition = this.commandDefinitions[command];
            if (!definition) {
                return {
                    error: `Unknown command: ${command}`,
                    suggestion: 'Use /help to see all commands'
                };
            }
            
            return {
                command: `/${command}`,
                description: definition.description,
                parameters: definition.parameters,
                examples: this.getCommandExamples(command),
                aliases: this.getCommandAliases(command),
                relatedCommands: this.getRelatedCommands(command)
            };
        }
        
        // General help
        const commandList = Object.entries(this.commandDefinitions)
            .map(([name, def]) => ({
                command: `/${name}`,
                description: def.description,
                aliases: this.getCommandAliases(name)
            }));
        
        return {
            title: 'Construction Syndicate Commands',
            commands: commandList,
            usage: 'Type /command [parameters] to execute',
            examples: [
                '/plan authentication system',
                '/hoai check LP3',
                '/implement UserService --with-tests'
            ],
            tips: [
                'Commands can be chained for workflows',
                'Use tab completion for command names',
                'Add --help to any command for details'
            ]
        };
    }
    
    getCommandExamples(command) {
        const examples = {
            plan: [
                '/plan user authentication system',
                '/plan migration to microservices --timeframe="3 months"',
                '/plan HOAI phase transition --includeHOAI=true'
            ],
            hoai: [
                '/hoai check LP3',
                '/hoai calculate --projectId="berlin-office" --phase="LP4"',
                '/hoai validate --projectId="munich-tower"'
            ],
            implement: [
                '/implement UserAuthService --withTests=true',
                '/implement PaymentGateway --style="functional"',
                '/implement CacheLayer --testCoverage=90'
            ],
            quantum: [
                '/quantum optimize routing-algorithm',
                '/quantum enhance neural-network --algorithm="qaoa"',
                '/quantum analyze quantum-state'
            ],
            analyze: [
                '/analyze --type="security" --target="auth-module"',
                '/analyze --type="performance" --target="src/quantum/" --depth="deep"',
                '/analyze --type="all" --target="entire-codebase"'
            ]
        };
        
        return examples[command] || [`/${command} [parameters]`];
    }
    
    getCommandAliases(command) {
        const aliases = {
            plan: ['p', 'strategize'],
            hoai: ['h', 'compliance'],
            architect: ['arc', 'design'],
            implement: ['i', 'code', 'generate'],
            quantum: ['q', 'optimize'],
            syndicate: ['syn', 'coordinate'],
            analyze: ['a', 'inspect'],
            test: ['t', 'verify'],
            deploy: ['d', 'ship'],
            document: ['doc', 'docs']
        };
        
        return aliases[command] || [];
    }
    
    getRelatedCommands(command) {
        const related = {
            plan: ['architect', 'implement', 'hoai'],
            hoai: ['plan', 'document', 'validate'],
            architect: ['plan', 'implement', 'document'],
            implement: ['test', 'document', 'deploy'],
            quantum: ['optimize', 'analyze', 'enhance'],
            syndicate: ['plan', 'coordinate', 'monitor'],
            analyze: ['test', 'optimize', 'document'],
            test: ['implement', 'analyze', 'deploy'],
            deploy: ['test', 'monitor', 'rollback'],
            document: ['implement', 'test', 'publish']
        };
        
        return related[command] || [];
    }
    
    // Analytics
    
    async logCommandUsage(command, parameters) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO command_usage
                (command, parameters, user_id, timestamp)
                VALUES ($1, $2, $3, NOW())
            `, [command, JSON.stringify(parameters), this.getCurrentUser()]);
        } catch (error) {
            console.error('Failed to log command usage:', error);
        } finally {
            client.release();
        }
    }
    
    async logCommandResult(command, result, duration) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO command_results
                (command, success, duration_ms, error, timestamp)
                VALUES ($1, $2, $3, $4, NOW())
            `, [
                command,
                result.success !== false,
                duration,
                result.error || null
            ]);
        } catch (error) {
            console.error('Failed to log command result:', error);
        } finally {
            client.release();
        }
    }
    
    startAnalytics() {
        // Periodic analytics reporting
        setInterval(() => {
            this.reportAnalytics();
        }, 3600000); // Every hour
    }
    
    async reportAnalytics() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    command,
                    COUNT(*) as usage_count,
                    AVG(CASE WHEN success THEN 1 ELSE 0 END) as success_rate,
                    AVG(duration_ms) as avg_duration,
                    MAX(timestamp) as last_used
                FROM command_results
                WHERE timestamp > NOW() - INTERVAL '24 hours'
                GROUP BY command
                ORDER BY usage_count DESC
            `);
            
            console.log('Command Analytics (24h):', result.rows);
            
        } finally {
            client.release();
        }
    }
    
    getCurrentUser() {
        // In production, get from auth context
        return 'current-user';
    }
    
    // Lifecycle
    
    async shutdown() {
        console.log('Shutting down Commands MCP Server');
        // Cleanup resources
    }
}

// Export for MCP
export const createCommandsServer = async () => {
    const server = new CommandsServer();
    await server.initialize();
    return server;
};

export default CommandsServer;
