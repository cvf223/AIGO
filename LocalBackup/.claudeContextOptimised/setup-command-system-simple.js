#!/usr/bin/env node

// setup-command-system-simple.js - Simple Setup Script for Construction Syndicate Command System
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
            await this.initializeDatabase();
            await this.generateConfigurations();
            await this.createExamples();
            
            this.printSuccessMessage();
            
        } catch (error) {
            console.error('\n❌ Setup failed:', error.message);
            process.exit(1);
        }
    }
    
    async checkPrerequisites() {
        console.log('✓ Checking prerequisites...');
        
        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        
        if (majorVersion < 20) {
            throw new Error(`Node.js 20+ required, found ${nodeVersion}`);
        }
        console.log(`  ✓ Node.js ${nodeVersion} detected`);
        
        // Check for .env file
        const envPath = path.join(this.rootDir, '.env');
        if (!await fs.access(envPath).then(() => true).catch(() => false)) {
            await this.createEnvFile();
        }
        
        console.log('✓ Prerequisites checked\n');
    }
    
    async createDirectoryStructure() {
        console.log('✓ Creating directory structure...');
        
        const directories = [
            'skills/planning-skills',
            'skills/compliance-skills',
            'skills/architecture-skills',
            'skills/development-skills',
            'skills/quantum-skills',
            'skills/coordination-skills',
            'skills/analysis-skills',
            'skills/testing-skills',
            'skills/deployment-skills',
            'skills/documentation-skills',
            'mcp-servers',
            'workflow-automation',
            'analytics',
            'dashboard',
            'tests',
            'examples',
            'contexts',
            'slash-commands',
            'templates'
        ];
        
        for (const dir of directories) {
            const fullPath = path.join(this.claudeDir, dir);
            await fs.mkdir(fullPath, { recursive: true });
            console.log(`  ✓ Created ${dir}`);
        }
        
        console.log('✓ Directory structure created\n');
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

# Memory Configuration
NODE_OPTIONS="--max-old-space-size=409600"

# Logging
LOG_LEVEL=info
`;
        
        await fs.writeFile(path.join(this.rootDir, '.env'), envContent);
        console.log('✓ Created .env file - Please update with your values');
    }
    
    async initializeDatabase() {
        console.log('✓ Creating database setup script...');
        
        const dbSetupSQL = `-- Construction Syndicate Command System Database Setup

-- Create database (run this separately if needed)
-- CREATE DATABASE construction_syndicate;

-- Connect to construction_syndicate database before running the rest

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

CREATE TABLE IF NOT EXISTS command_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command VARCHAR(50) NOT NULL,
    execution_id VARCHAR(255),
    user_id VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX IF NOT EXISTS idx_command_feedback_command ON command_feedback(command, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_frequency ON command_patterns(frequency DESC);

-- Initial data
INSERT INTO workflow_definitions (id, name, definition, created_by)
VALUES 
    ('newFeature', 'New Feature Development', '{"steps": []}', 'system'),
    ('hoaiCompliance', 'HOAI Compliance Check', '{"steps": []}', 'system'),
    ('emergencyHotfix', 'Emergency Hotfix', '{"steps": []}', 'system')
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as status;
`;
        
        const setupPath = path.join(this.claudeDir, 'database-setup.sql');
        await fs.writeFile(setupPath, dbSetupSQL);
        
        console.log('✓ Database script created at: ' + setupPath);
        console.log('\n📋 To set up the database, run:');
        console.log('   1. createdb construction_syndicate');
        console.log('   2. psql -U postgres -d construction_syndicate -f ' + setupPath + '\n');
    }
    
    async generateConfigurations() {
        console.log('✓ Generating configurations...');
        
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
            "claude.defaultMode": "AcceptEdits"
        };
        
        const vscodeDir = path.join(this.rootDir, '.vscode');
        await fs.mkdir(vscodeDir, { recursive: true });
        await fs.writeFile(
            path.join(vscodeDir, 'claude.json'),
            JSON.stringify(vscodeSettings, null, 2)
        );
        console.log('  ✓ Created VS Code settings');
        
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
            }
        };
        
        await fs.writeFile(
            path.join(this.claudeDir, 'shortcuts.json'),
            JSON.stringify(shortcuts, null, 2)
        );
        console.log('  ✓ Created command shortcuts');
        
        console.log('✓ Configurations generated\n');
    }
    
    async createExamples() {
        console.log('✓ Creating example files...');
        
        // Quick start examples
        const quickStart = `# Quick Start Examples

## Try These Commands

### 1. Plan a New Feature
\`\`\`
/plan user authentication system with OAuth2
\`\`\`

### 2. Check HOAI Compliance
\`\`\`
/hoai check LP3
\`\`\`

### 3. Generate Implementation
\`\`\`
/implement AuthenticationService
\`\`\`

### 4. Run a Workflow
\`\`\`
/workflow newFeature feature_name="payment-system"
\`\`\`

### 5. Get Help
\`\`\`
/help
\`\`\`
`;
        
        await fs.writeFile(
            path.join(this.claudeDir, 'examples/quick-start.md'),
            quickStart
        );
        console.log('  ✓ Created quick start examples');
        
        console.log('✓ Examples created\n');
    }
    
    printSuccessMessage() {
        console.log('\n✅ Construction Syndicate Command System Setup Complete!\n');
        
        console.log('📚 Documentation:');
        console.log('   - Quick Start: .claude/QUICKSTART-COMMANDS.md');
        console.log('   - Command Reference: .claude/slash-commands/README.md');
        console.log('   - Examples: .claude/examples/');
        
        console.log('\n🚀 Next Steps:');
        console.log('   1. Update your .env file with correct values');
        console.log('   2. Set up the PostgreSQL database:');
        console.log('      - createdb construction_syndicate');
        console.log('      - psql -U postgres -d construction_syndicate -f .claude/database-setup.sql');
        console.log('   3. Start using commands in Claude!');
        
        console.log('\n💡 Try these commands:');
        console.log('   /plan new feature for user management');
        console.log('   /hoai check LP3');
        console.log('   /help');
        
        console.log('\n🎯 Key Features:');
        console.log('   ✓ 11 powerful slash commands');
        console.log('   ✓ Advanced workflow automation');
        console.log('   ✓ Real-time analytics dashboard');
        console.log('   ✓ Complete test suite');
        console.log('   ✓ Production-grade architecture');
        
        console.log('\n🎉 Happy coding with Construction Syndicate!\n');
    }
}

// Run setup
const setup = new CommandSystemSetup();
setup.setup().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
});
