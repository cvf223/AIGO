# Claude Code Slash Commands & Development Setup Guide

## Overview

This guide provides comprehensive instructions for setting up slash commands and optimizing your Claude Code development environment for the Construction Syndicate project.

## 🚀 Slash Commands Setup

While Claude doesn't natively support custom slash commands in the traditional sense, you can achieve similar functionality through several approaches:

### 1. Agent Skills Integration

Agent Skills are the primary way to extend Claude's capabilities with custom workflows and commands.

### 2. MCP Server Commands

Model Context Protocol (MCP) servers can expose tool functions that act like commands.

### 3. Structured Prompts

Using consistent prompt patterns that Claude recognizes and responds to predictably.

## 📋 Recommended Commands for Construction Syndicate

### Planning & Architecture Commands

#### `/plan` - Strategic Planning
Creates comprehensive project plans using ZAP Engine integration.

#### `/architect` - System Architecture
Generates architectural diagrams and system design documents.

#### `/hoai` - HOAI Compliance Check
Validates project phases against HOAI regulations.

### Development Commands

#### `/implement` - Code Implementation
Generates production-ready code following all workspace rules.

#### `/test` - Testing Suite
Creates comprehensive tests for new features.

#### `/deploy` - Deployment Pipeline
Initiates deployment workflows with safety checks.

### Analysis Commands

#### `/analyze` - Code Analysis
Deep analysis of existing codebase with improvement suggestions.

#### `/security` - Security Audit
Performs security analysis and suggests improvements.

#### `/performance` - Performance Analysis
Analyzes performance bottlenecks and suggests optimizations.

### Documentation Commands

#### `/document` - Documentation Generation
Creates comprehensive documentation for systems or features.

#### `/api` - API Documentation
Generates OpenAPI/Swagger documentation.

#### `/workflow` - Workflow Documentation
Documents complex workflows for architects and investors.

## 🛠️ Implementation Guide

### Method 1: Custom Skills

Create skill folders for each command category:

```
.claude/skills/
├── planning-skills/
│   ├── plan-command/
│   │   ├── manifest.json
│   │   ├── instructions.md
│   │   └── templates/
│   ├── architect-command/
│   └── hoai-command/
├── development-skills/
│   ├── implement-command/
│   ├── test-command/
│   └── deploy-command/
├── analysis-skills/
│   ├── analyze-command/
│   ├── security-command/
│   └── performance-command/
└── documentation-skills/
    ├── document-command/
    ├── api-command/
    └── workflow-command/
```

### Method 2: MCP Server Integration

Create MCP servers that expose command-like tools:

```javascript
// .claude/mcp-servers/commands-server.js
export const commandsServer = {
  name: 'construction-commands',
  version: '1.0.0',
  tools: {
    plan: {
      description: 'Create strategic plans for construction projects',
      parameters: {
        type: 'object',
        properties: {
          scope: { type: 'string', enum: ['project', 'feature', 'architecture'] },
          context: { type: 'string' }
        }
      },
      handler: async ({ scope, context }) => {
        // Implementation using ZAP Engine
      }
    },
    hoai: {
      description: 'Check HOAI compliance for project phase',
      parameters: {
        type: 'object',
        properties: {
          phase: { type: 'string', pattern: '^LP[1-9]$' },
          projectId: { type: 'string' }
        }
      },
      handler: async ({ phase, projectId }) => {
        // HOAI validation logic
      }
    }
  }
};
```

### Method 3: Prompt Templates

Create standardized prompt templates that trigger specific behaviors:

```markdown
# .claude/prompts/commands.md

## /plan Command Template
When I say "/plan [topic]", please:
1. Use the ZAP Engine for strategic planning
2. Create a comprehensive plan with:
   - Objectives and goals
   - Task breakdown
   - Dependencies
   - Timeline
   - Risk assessment
   - Success metrics
3. Format as a structured document

## /implement Command Template
When I say "/implement [feature]", please:
1. Analyze existing codebase
2. Create production-ready implementation
3. Include all necessary imports
4. Add comprehensive error handling
5. Create tests
6. Update documentation
```

## 🎯 Best Practices for Claude Code Development

### 1. Project Structure

```
construction-syndicate/
├── .claude/                    # Claude-specific configuration
│   ├── claude.md              # Main context document
│   ├── skills/                # Custom skills
│   ├── mcp-servers/           # MCP server configurations
│   ├── prompts/               # Prompt templates
│   ├── contexts/              # Domain-specific contexts
│   └── slash-commands/        # Command documentation
├── src/                       # Source code
├── tests/                     # Test suites
├── docs/                      # Documentation
└── README.md                  # Project overview
```

### 2. Context Management

#### Primary Context File (.claude/claude.md)
- Keep under 2000 lines
- Focus on high-level patterns and rules
- Reference other context files for details

#### Domain-Specific Contexts
- One file per major domain
- Include relevant code snippets
- Update after major changes

### 3. Workflow Optimization

#### Permission Modes
```bash
# For daily development (auto-accepts file edits)
claude --mode AcceptEdits

# For code review (read-only)
claude --mode Plan

# For trusted environments (no prompts)
claude --mode BypassPermissions
```

#### Incremental Development
1. Start with clear requirements
2. Use "/plan" for architecture
3. Implement in small chunks
4. Test incrementally
5. Document as you go

### 4. Memory and State Management

#### Persistent Context
- Use `update_memory` tool for important decisions
- Reference memories with [[memory:ID]]
- Regularly review and update memories

#### Session Management
- Save important context at session end
- Start new sessions with context summary
- Use TODO system for task continuity

### 5. Integration Best Practices

#### MCP Servers
- One server per domain (construction, database, etc.)
- Implement health checks
- Use connection pooling
- Add comprehensive logging

#### Skills Development
- Keep skills focused and modular
- Version control skill definitions
- Test skills in isolation
- Document skill capabilities

### 6. Performance Optimization

#### Large Codebase Navigation
```markdown
# Effective search patterns
/analyze "specific function name"
/grep "pattern" --include="*.js"
/find "construction-specific term"
```

#### Parallel Operations
- Use multiple tool calls simultaneously
- Batch related operations
- Minimize sequential dependencies

### 7. Security Considerations

#### Sensitive Data
- Never commit credentials
- Use environment variables
- Implement proper encryption
- Regular security audits with "/security"

#### Access Control
- Implement RBAC for commands
- Audit command usage
- Set appropriate permission levels

## 🔧 Advanced Configuration

### Custom Command Registry

```javascript
// .claude/command-registry.js
export const commandRegistry = {
  '/plan': {
    description: 'Strategic planning with ZAP Engine',
    category: 'planning',
    permissions: ['architect', 'manager'],
    implementation: 'skills/planning-skills/plan-command',
    shortcuts: ['/p', '/strategize'],
    parameters: {
      required: ['scope'],
      optional: ['timeframe', 'constraints', 'stakeholders']
    }
  },
  '/hoai': {
    description: 'HOAI compliance validation',
    category: 'compliance',
    permissions: ['architect', 'compliance_officer'],
    implementation: 'mcp-servers/hoai-server',
    shortcuts: ['/h', '/compliance'],
    parameters: {
      required: ['phase'],
      optional: ['projectId', 'checkLevel']
    }
  },
  '/implement': {
    description: 'Generate production-ready code',
    category: 'development',
    permissions: ['developer', 'architect'],
    implementation: 'skills/development-skills/implement-command',
    shortcuts: ['/i', '/code'],
    parameters: {
      required: ['feature'],
      optional: ['testLevel', 'documentation']
    }
  }
};
```

### Command Chaining

```markdown
# Example of chaining commands
/plan authentication system
/architect microservice design
/implement auth service
/test integration tests
/document API endpoints
/deploy staging environment
```

### Conditional Commands

```javascript
// .claude/conditional-commands.js
export const conditionalCommands = {
  '/deploy': {
    preConditions: [
      { command: '/test', minCoverage: 80 },
      { command: '/security', severity: 'medium' },
      { command: '/hoai', compliant: true }
    ],
    onSuccess: '/document deployment',
    onFailure: '/analyze failures'
  }
};
```

## 📚 Command Documentation Template

For each custom command, create documentation following this template:

```markdown
# /command-name

## Description
Brief description of what the command does.

## Usage
```
/command-name [required-param] [optional-param]
```

## Parameters
- `required-param`: Description (required)
- `optional-param`: Description (optional, default: value)

## Examples
```
/command-name example-value
/command-name example-value --option=value
```

## Output
Description of what the command produces.

## Related Commands
- `/related-command1`: How it relates
- `/related-command2`: How it relates

## Implementation Details
- Uses: [specific system or engine]
- Permissions: [required roles]
- Performance: [execution time expectations]
```

## 🚀 Getting Started

1. **Create the command structure**:
   ```bash
   mkdir -p .claude/{skills,mcp-servers,prompts,slash-commands}
   ```

2. **Define your commands** in `.claude/command-registry.js`

3. **Implement command handlers** using Skills or MCP servers

4. **Document each command** in `.claude/slash-commands/`

5. **Test commands** in isolation before integration

6. **Share with team** through version control

## 🎯 Recommended Command Set for Construction Syndicate

### Essential Commands
- `/plan` - Strategic planning with ZAP
- `/hoai` - HOAI compliance checking
- `/implement` - Code generation
- `/test` - Test creation
- `/document` - Documentation generation

### Advanced Commands
- `/architect` - System design
- `/quantum` - Quantum-inspired optimization
- `/syndicate` - Multi-agent coordination
- `/tender` - Tender document generation
- `/safety` - Safety protocol validation

### Utility Commands
- `/analyze` - Code analysis
- `/optimize` - Performance optimization
- `/security` - Security audit
- `/migrate` - Database migrations
- `/deploy` - Deployment pipeline

By implementing this command system, you'll have a powerful, structured way to interact with Claude for all aspects of the Construction Syndicate development!
