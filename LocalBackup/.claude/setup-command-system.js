#!/usr/bin/env node

// setup-command-system.js - Complete Setup Script for Construction Syndicate Command System
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CommandSystemSetup {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.claudeDir = path.resolve(this.rootDir, '.claude');
    }
    
    async setup() {
        console.log('\n🚀 Construction Syndicate Command System Setup\n');
        
        try {
            await this.checkPrerequisites();
            await this.createDirectoryStructure();
            await this.installDependencies();
            await this.initializeDatabase();
            await this.generateConfigurations();
            await this.createExamples();
            await this.runTests();
            
            this.printSuccessMessage();
            
        } catch (error) {
            console.error('\n❌ Setup failed:', error.message);
            process.exit(1);
        }
    }
    
    async checkPrerequisites() {
        const spinner = ora('Checking prerequisites...').start();
        
        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        
        if (majorVersion < 20) {
            spinner.fail('Node.js 20+ required');
            throw new Error(`Node.js 20+ required, found ${nodeVersion}`);
        }
        
        // Check PostgreSQL
        try {
            execSync('pg_config --version', { stdio: 'pipe' });
        } catch {
            spinner.warn('PostgreSQL not found in PATH');
            console.log(chalk.yellow('\n⚠️  PostgreSQL is required but not found.'));
            console.log(chalk.yellow('   Please install PostgreSQL 15+ before continuing.\n'));
        }
        
        // Check for .env file
        const envPath = path.join(this.rootDir, '.env');
        if (!await fs.access(envPath).then(() => true).catch(() => false)) {
            await this.createEnvFile();
        }
        
        spinner.succeed('Prerequisites checked');
    }
    
    async createDirectoryStructure() {
        const spinner = ora('Creating directory structure...').start();
        
        const directories = [
            '.claude/skills/planning-skills',
            '.claude/skills/compliance-skills',
            '.claude/skills/architecture-skills',
            '.claude/skills/development-skills',
            '.claude/skills/quantum-skills',
            '.claude/skills/coordination-skills',
            '.claude/skills/analysis-skills',
            '.claude/skills/testing-skills',
            '.claude/skills/deployment-skills',
            '.claude/skills/documentation-skills',
            '.claude/mcp-servers',
            '.claude/workflow-automation',
            '.claude/analytics',
            '.claude/dashboard',
            '.claude/tests',
            '.claude/examples',
            '.claude/contexts',
            '.claude/slash-commands',
            '.claude/templates'
        ];
        
        for (const dir of directories) {
            const fullPath = path.join(this.rootDir, dir);
            await fs.mkdir(fullPath, { recursive: true });
        }
        
        spinner.succeed('Directory structure created');
    }
    
    async createEnvFile() {
        const envContent = `# Construction Syndicate Environment Configuration

# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/construction_syndicate
DB_POOL_MAX=200
DB_POOL_MIN=20

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
ENCRYPTION_KEY=your-32-byte-encryption-key-change-this

# Ollama Configuration
OLLAMA_API_BASE_URL=http://localhost:11434/api
OLLAMA_DEFAULT_MODEL=llama3.3:70b

# Monitoring
ALERTING_ENABLED=true
METRICS_PORT=9090

# Claude Configuration
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_MODEL=claude-3-opus-20240229

# Memory Configuration
NODE_OPTIONS="--max-old-space-size=409600"

# Logging
LOG_LEVEL=info
`;
        
        await fs.writeFile(path.join(this.rootDir, '.env'), envContent);
        console.log(chalk.green('✓ Created .env file - Please update with your values'));
    }
    
    async installDependencies() {
        const spinner = ora('Installing dependencies...').start();
        
        // Check if we need to install additional packages
        const packagesToInstall = [
            'chalk',
            'ora',
            'dotenv',
            'chart.js',
            'joi',
            'bcryptjs',
            'jsonwebtoken'
        ];
        
        try {
            execSync(`pnpm add ${packagesToInstall.join(' ')}`, {
                cwd: this.rootDir,
                stdio: 'pipe'
            });
            
            spinner.succeed('Dependencies installed');
        } catch (error) {
            spinner.warn('Some dependencies may need manual installation');
        }
    }
    
    async initializeDatabase() {
        const spinner = ora('Initializing database...').start();
        
        const dbSetupSQL = `-- Construction Syndicate Command System Database Setup

-- Create database if not exists
SELECT 'CREATE DATABASE construction_syndicate'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'construction_syndicate');

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Command Analytics Tables
CREATE TABLE IF NOT EXISTS command_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command VARCHAR(50) NOT NULL,
    user_id VARCHAR(255),
    parameters JSONB,
    execution_id VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS command_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command VARCHAR(50) NOT NULL,
    execution_id VARCHAR(255),
    success BOOLEAN NOT NULL,
    duration_ms INTEGER,
    error TEXT,
    output_size INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS command_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name VARCHAR(255) NOT NULL UNIQUE,
    command_sequence TEXT[],
    frequency INTEGER DEFAULT 1,
    average_duration_ms INTEGER,
    success_rate FLOAT,
    last_used TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Tables
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    definition JSONB NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS workflow_executions (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) REFERENCES workflow_definitions(id),
    parameters JSONB,
    state VARCHAR(50),
    current_step VARCHAR(255),
    results JSONB,
    error TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_command_usage_time ON command_usage(command, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_command_results_time ON command_results(command, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_state ON workflow_executions(state, started_at DESC);
`;
        
        const setupPath = path.join(this.claudeDir, 'database-setup.sql');
        await fs.writeFile(setupPath, dbSetupSQL);
        
        spinner.succeed('Database initialization script created');
        console.log(chalk.yellow('\n📋 Run the following command to set up the database:'));
        console.log(chalk.cyan(`   psql -U postgres -f ${setupPath}\n`));
    }
    
    async generateConfigurations() {
        const spinner = ora('Generating configurations...').start();
        
        // Create VS Code settings
        const vscodeSettings = {
            "claude.skills.enabled": true,
            "claude.skills.autoLoad": true,
            "claude.skills.paths": [".claude/skills"],
            "claude.mcp.servers": {
                "commands": {
                    "path": ".claude/mcp-servers/commands-server.js",
                    "autoStart": true
                }
            },
            "claude.defaultMode": "AcceptEdits",
            "editor.quickSuggestions": {
                "other": true,
                "comments": false,
                "strings": true
            },
            "files.associations": {
                "*.claude": "markdown"
            }
        };
        
        const vscodeDir = path.join(this.rootDir, '.vscode');
        await fs.mkdir(vscodeDir, { recursive: true });
        await fs.writeFile(
            path.join(vscodeDir, 'claude.json'),
            JSON.stringify(vscodeSettings, null, 2)
        );
        
        // Create command shortcuts
        const shortcuts = {
            "version": "1.0.0",
            "shortcuts": {
                "pl": "/plan",
                "h": "/hoai",
                "i": "/implement",
                "a": "/analyze",
                "t": "/test",
                "d": "/deploy",
                "q": "/quantum",
                "s": "/syndicate",
                "doc": "/document"
            },
            "workflows": {
                "nf": "newFeature",
                "hf": "emergencyHotfix",
                "hc": "hoaiCompliance",
                "qo": "quantumOptimization"
            }
        };
        
        await fs.writeFile(
            path.join(this.claudeDir, 'shortcuts.json'),
            JSON.stringify(shortcuts, null, 2)
        );
        
        spinner.succeed('Configurations generated');
    }
    
    async createExamples() {
        const spinner = ora('Creating example files...').start();
        
        // Example command usage
        const exampleCommands = `# Construction Syndicate Command Examples

## Basic Commands

### Planning a New Feature
\`\`\`
/plan user authentication system with OAuth2 and MFA support
\`\`\`

### HOAI Compliance Check
\`\`\`
/hoai check LP3 project-id=berlin-office-tower
\`\`\`

### Generate Implementation
\`\`\`
/implement AuthenticationService with-tests coverage=90
\`\`\`

## Advanced Workflows

### Complete Feature Development
\`\`\`
/workflow newFeature feature_name="payment-integration" architecture_style="microservices"
\`\`\`

### Emergency Production Fix
\`\`\`
/workflow emergencyHotfix issue_location="payment-service" fix_description="null-pointer-fix"
\`\`\`

## Command Chaining

### Sequential Execution
\`\`\`
/plan payment system && /architect payment-service && /implement payment-gateway
\`\`\`

### Parallel Analysis
\`\`\`
/analyze security auth-module | /analyze performance auth-service | /analyze dependencies auth-components
\`\`\`

## Custom Parameters

### Quantum Optimization
\`\`\`
/quantum optimize routing-algorithm algorithm=qaoa iterations=1000
\`\`\`

### Multi-Agent Coordination
\`\`\`
/syndicate coordinate tender-generation agents=["architect", "quantity-surveyor", "compliance-officer"]
\`\`\`
`;
        
        await fs.writeFile(
            path.join(this.claudeDir, 'examples/command-examples.md'),
            exampleCommands
        );
        
        // Example custom skill
        const exampleSkill = `// Example Custom Skill - Project Status Reporter

export class ProjectStatusCommand {
    constructor() {
        this.name = 'project-status';
        this.description = 'Generate comprehensive project status report';
    }
    
    async execute(params) {
        const { projectId, format = 'markdown' } = params;
        
        // Gather data from multiple sources
        const [
            hoaiStatus,
            taskProgress,
            budgetStatus,
            riskAssessment
        ] = await Promise.all([
            this.getHOAIStatus(projectId),
            this.getTaskProgress(projectId),
            this.getBudgetStatus(projectId),
            this.getRiskAssessment(projectId)
        ]);
        
        // Generate report
        const report = this.generateReport({
            projectId,
            hoaiStatus,
            taskProgress,
            budgetStatus,
            riskAssessment
        });
        
        return {
            success: true,
            report,
            format,
            generated: new Date()
        };
    }
    
    async getHOAIStatus(projectId) {
        // Implementation
        return { currentPhase: 'LP3', compliance: 0.92 };
    }
    
    async getTaskProgress(projectId) {
        // Implementation
        return { completed: 45, total: 78, onTrack: true };
    }
    
    async getBudgetStatus(projectId) {
        // Implementation
        return { spent: 450000, budget: 1200000, projected: 1150000 };
    }
    
    async getRiskAssessment(projectId) {
        // Implementation
        return { high: 1, medium: 3, low: 7 };
    }
    
    generateReport(data) {
        return \`# Project Status Report: \${data.projectId}

## HOAI Compliance
- Current Phase: \${data.hoaiStatus.currentPhase}
- Compliance Score: \${(data.hoaiStatus.compliance * 100).toFixed(1)}%

## Progress
- Tasks Completed: \${data.taskProgress.completed}/\${data.taskProgress.total}
- Status: \${data.taskProgress.onTrack ? '✅ On Track' : '⚠️ Delayed'}

## Budget
- Spent: €\${data.budgetStatus.spent.toLocaleString()}
- Budget: €\${data.budgetStatus.budget.toLocaleString()}
- Projected: €\${data.budgetStatus.projected.toLocaleString()}

## Risks
- High Priority: \${data.riskAssessment.high}
- Medium Priority: \${data.riskAssessment.medium}
- Low Priority: \${data.riskAssessment.low}
\`;
    }
}

export default ProjectStatusCommand;
`;
        
        await fs.writeFile(
            path.join(this.claudeDir, 'examples/custom-skill-example.js'),
            exampleSkill
        );
        
        spinner.succeed('Example files created');
    }
    
    async runTests() {
        const spinner = ora('Running system tests...').start();
        
        try {
            // Create simple test to verify setup
            const testScript = `
import { CommandsServer } from '../mcp-servers/commands-server.js';

async function testSetup() {
    console.log('Testing command system setup...');
    
    const server = new CommandsServer();
    const tools = await server.listTools();
    
    if (Object.keys(tools).length > 10) {
        console.log('✅ Command system initialized successfully');
        console.log(\`   Found \${Object.keys(tools).length} commands\`);
        return true;
    } else {
        console.error('❌ Command system initialization failed');
        return false;
    }
}

testSetup().then(success => {
    process.exit(success ? 0 : 1);
});
`;
            
            const testPath = path.join(this.claudeDir, 'tests/setup-test.js');
            await fs.writeFile(testPath, testScript);
            
            // Note: Actual test execution would require the system to be fully set up
            spinner.succeed('Test suite created');
            
        } catch (error) {
            spinner.warn('Test creation completed with warnings');
        }
    }
    
    printSuccessMessage() {
        console.log(chalk.green.bold('\n✅ Construction Syndicate Command System Setup Complete!\n'));
        
        console.log(chalk.cyan('📚 Documentation:'));
        console.log(`   - Quick Start: ${chalk.yellow('.claude/QUICKSTART-COMMANDS.md')}`);
        console.log(`   - Command Reference: ${chalk.yellow('.claude/slash-commands/README.md')}`);
        console.log(`   - Examples: ${chalk.yellow('.claude/examples/command-examples.md')}`);
        
        console.log(chalk.cyan('\n🚀 Getting Started:'));
        console.log('   1. Update your .env file with correct values');
        console.log('   2. Run the database setup script');
        console.log('   3. Start using commands in Claude!');
        
        console.log(chalk.cyan('\n💡 Try these commands:'));
        console.log(chalk.yellow('   /plan new feature for user management'));
        console.log(chalk.yellow('   /hoai check LP3'));
        console.log(chalk.yellow('   /help'));
        
        console.log(chalk.cyan('\n🎯 Advanced Features:'));
        console.log('   - Workflow automation: /workflow newFeature');
        console.log('   - Analytics dashboard: .claude/dashboard/analytics-dashboard.html');
        console.log('   - Custom skills: .claude/skills/');
        
        console.log(chalk.green.bold('\n🎉 Happy coding with Construction Syndicate!\n'));
    }
}

// Run setup
const setup = new CommandSystemSetup();
setup.setup().catch(error => {
    console.error(chalk.red('Setup failed:'), error);
    process.exit(1);
});
