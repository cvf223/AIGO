# MCP (Model Context Protocol) Server Configuration

This directory contains configuration and documentation for all MCP servers used in the AIGO-Syndicate Construction Intelligence system.

## Essential MCP Servers

### 1. Filesystem MCP
- **Purpose**: File operations and codebase navigation
- **Config**: `filesystem-mcp.json`
- **Features**: Read, write, search, directory listing

### 2. Postgres MCP
- **Purpose**: Direct database access and queries
- **Config**: `postgres-mcp.json`
- **Features**: SQL queries, schema management, data persistence

### 3. GitHub MCP
- **Purpose**: Version control and collaboration
- **Config**: `github-mcp.json`
- **Features**: Repository management, PR/Issue handling, code search

### 4. Memory MCP
- **Purpose**: Persistent context across sessions
- **Config**: `memory-mcp.json`
- **Features**: Context retention, knowledge management, state persistence

## Installation Guide

### Prerequisites
```bash
# Ensure Node.js 18+ is installed
node --version

# Install pnpm if not already installed
npm install -g pnpm
```

### Installation Steps

1. **Install MCP CLI**
```bash
pnpm add -g @modelcontextprotocol/cli
```

2. **Install Essential Servers**
```bash
# Filesystem MCP
pnpm add -g @modelcontextprotocol/server-filesystem

# Postgres MCP
pnpm add -g @modelcontextprotocol/server-postgres

# GitHub MCP
pnpm add -g @modelcontextprotocol/server-github

# Memory MCP
pnpm add -g @modelcontextprotocol/server-memory
```

3. **Configure Servers**
Each server has its own configuration file in this directory. Update the configurations with your specific settings.

4. **Start Servers**
```bash
# Start all essential servers
mcp start --config .claude/mcp-servers/mcp-config.json
```

## Server Configurations

### Filesystem MCP
Provides secure file system access with configurable permissions.

### Postgres MCP
Connects to the construction_syndicate database for all data operations.

### GitHub MCP
Integrates with the AIGO-Syndicate repository for version control.

### Memory MCP
Manages persistent memory across AI sessions using advanced storage strategies.

## Security Considerations

- All servers run with least-privilege access
- Credentials are stored in environment variables
- Audit logging is enabled for all operations
- Quantum-safe encryption for sensitive data

## Monitoring

- Health checks run every 60 seconds
- Performance metrics collected via Prometheus
- Alerts configured for service degradation
- Automatic failover for critical services

## Advanced MCP Servers (Future)

The system supports 30+ specialized MCP servers. See `advanced-mcp-servers.md` for the complete list including:
- Quantum Analysis MCP
- HOAI Compliance MCP
- VLM Integration MCP
- Internet of Agents MCP
- And many more...
