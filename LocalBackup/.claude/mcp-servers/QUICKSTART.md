# MCP Servers Quick Start Guide

## 🚀 5-Minute Setup

### 1. Install MCP Servers
```bash
cd .claude/mcp-servers
./install-mcp-servers.sh
```

### 2. Configure Environment
```bash
cp .env.mcp.template .env.mcp
# Edit .env.mcp with your credentials
```

### 3. Start Servers
```bash
node start-mcp-servers.js
```

## 🔧 Essential Configuration

### PostgreSQL Connection
Edit `postgres-mcp.json`:
```json
{
  "connection": {
    "host": "your-db-host",
    "database": "your-db-name",
    "user": "your-db-user"
  }
}
```

### GitHub Token
Edit `github-mcp.json`:
```json
{
  "env": {
    "GITHUB_TOKEN": "ghp_your_token_here"
  }
}
```

## ✅ Verify Installation

### Check Server Status
```bash
curl http://localhost:9100/health
```

### Test Filesystem Access
```javascript
// In Claude Code Web
const files = await mcp.filesystem.list('/src');
```

### Test Database Connection
```javascript
const result = await mcp.postgres.query('SELECT NOW()');
```

## 🛠️ Troubleshooting

### Server Won't Start
1. Check Node.js version: `node --version` (needs 18+)
2. Verify PostgreSQL is running: `pg_isready`
3. Check port availability: `lsof -i :9100`

### Permission Errors
```bash
# Fix permissions
chmod -R 755 .claude/mcp-servers
```

### Connection Issues
1. Check firewall settings
2. Verify credentials in `.env.mcp`
3. Test network connectivity

## 📚 Next Steps

1. Review [advanced-mcp-servers.md](./advanced-mcp-servers.md) for additional servers
2. Configure monitoring dashboards
3. Set up automated backups
4. Enable production security features

## 🆘 Support

- Documentation: `.claude/mcp-servers/README.md`
- Logs: Check `~/.mcp/logs/`
- Health endpoint: `http://localhost:9100/health`

## 🎯 Production Checklist

- [ ] TLS certificates configured
- [ ] Authentication enabled
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Rate limiting enabled
- [ ] Audit logging active
- [ ] Security scan completed
- [ ] Performance baseline established
