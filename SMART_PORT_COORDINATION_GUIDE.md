# 🚀 SMART PORT COORDINATION GUIDE

## 📊 PORT ALLOCATION MAP
```
🌐 Backend Web GUI:     3001 - Main API and WebSocket server
🖥️ Frontend Web GUI:    3002 - Next.js construction interface  
🏗️ Construction System: 3003 - Construction syndicate services
📋 HOAI LP6/LP7 System: 3004 - German construction phases
📊 Monitoring Hub:      3005 - System monitoring (future)
```

## 🚀 STARTUP COMMANDS

### 🎯 Quick Start (All Systems)
```bash
ssh root@162.55.83.33
cd ~/ProductionCode
./master-system-coordinator.sh
```

### 🌐 Individual Systems

**Backend Only:**
```bash
ssh root@162.55.83.33 'cd ~/ProductionCode && PORT=3001 /usr/bin/node streamlined-web-gui-server.js'
```

**Frontend Only:**
```bash
ssh root@162.55.83.33 'cd ~/ProductionCode/web-gui-construction && PORT=3002 npm run start'
```

**Construction Syndicate:**
```bash
ssh root@162.55.83.33 'cd ~/ProductionCode && PORT=3003 /usr/bin/node start-construction-clean.js'
```

**HOAI System:**
```bash
ssh root@162.55.83.33 'cd ~/ProductionCode && PORT=3004 /usr/bin/node complete-hoai-lp6-lp7-execution.js'
```

## 🔍 SYSTEM MONITORING

### Status Check
```bash
ssh root@162.55.83.33 'curl http://localhost:3001/health && curl http://localhost:3002 > /dev/null && echo "All systems healthy"'
```

### Process Monitoring
```bash
ssh root@162.55.83.33 'ps aux | grep -E "(streamlined-web-gui-server|next-server|start-construction-clean|complete-hoai)" | grep -v grep'
```

### Port Usage
```bash
ssh root@162.55.83.33 'netstat -tulpn | grep -E ":300[1-5]" | sort'
```

## 🌐 ACCESS URLS

- **🖥️ Main Web Interface:** http://162.55.83.33:3002
- **🌐 Backend API:** http://162.55.83.33:3001  
- **🔌 WebSocket:** ws://162.55.83.33:3001
- **📋 API Documentation:** http://162.55.83.33:3001/api-docs

## 🛑 TROUBLESHOOTING

### Port Conflicts
```bash
# Kill all conflicting processes
ssh root@162.55.83.33 'pkill -f "streamlined-web-gui-server\|next-server\|start-construction-clean"'

# Kill specific ports
ssh root@162.55.83.33 'fuser -k 3001/tcp && fuser -k 3002/tcp && fuser -k 3003/tcp'
```

### Clean Restart
```bash
ssh root@162.55.83.33 'cd ~/ProductionCode && ./master-system-coordinator.sh'
```

## 🎯 FEATURES ENABLED

✅ **Chat Session Management** - Multiple conversation tabs
✅ **Real-time WebSocket** - Live updates and streaming  
✅ **Construction Specialists** - AI agents for different roles
✅ **HOAI LP6/LP7** - German construction phase execution
✅ **Plan Analysis** - Vision-based construction plan analysis
✅ **Smart Routing** - Automatic port allocation
✅ **Process Recovery** - Automatic restart on failure

## 📝 LOGS LOCATION
```
/root/ProductionCode/logs/
├── backend-3001.log     - Web GUI backend
├── frontend-3002.log    - Next.js frontend  
└── construction-3003.log - Construction syndicate
```

## 🔧 CONFIGURATION

All systems use environment variables for port configuration:
- `PORT` - Override default port
- `FRONTEND_PORT` - Frontend port for backend reference
- `NEXT_PUBLIC_API_URL` - API endpoint for frontend
- `NEXT_PUBLIC_WS_URL` - WebSocket endpoint for frontend
