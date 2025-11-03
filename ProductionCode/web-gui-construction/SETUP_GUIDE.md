# 🚀 Construction Syndicate GUI - Setup Guide

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0  
- PostgreSQL database (configured in main project)
- Construction Syndicate backend running

### Installation & Running

```bash
# 1. Install dependencies
cd web-gui-construction
pnpm install

# 2. Start the frontend (in web-gui-construction/)
pnpm dev
# Frontend will be available at: http://localhost:3002

# 3. Start the backend (from project root)
node startfullsyndicate.js
# This will:
# - Start Construction GUI Server on port 3001
# - Initialize all 60+ systems
# - Enable WebSocket on ws://localhost:3001
# - Start log monitoring on port 3001
```

### Verify Installation

1. **Check Backend Health:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Check Systems API:**
   ```bash
   curl http://localhost:3001/api/systems
   ```
   Should return list of 60+ systems

3. **Access Frontend:**
   Open browser to: http://localhost:3002

## Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────────────┐
│  FRONTEND (Next.js)                         │
│  http://localhost:3002                      │
│  - React 18 + JavaScript                    │
│  - Construction-themed UI                   │
│  - Socket.IO client                         │
└────────────┬────────────────────────────────┘
             │
             │ HTTP REST + WebSocket
             ▼
┌─────────────────────────────────────────────┐
│  BACKEND (Express + Socket.IO)              │
│  http://localhost:3001                      │
│  - construction-gui-server.js               │
│  - SystemMonitoringCollector.js             │
│  - Real-time broadcasting                   │
└────────────┬────────────────────────────────┘
             │
             │ Direct Reference
             ▼
┌─────────────────────────────────────────────┐
│  ORCHESTRATOR (Construction Syndicate)      │
│  startfullsyndicate.js                      │
│  - 60+ initialized systems                  │
│  - LLM services (Ollama)                    │
│  - Database integration                     │
└─────────────────────────────────────────────┘
```

## Features

### 1. LLM Chat Interface (`/chat`)

**Chat Targets:**
- Individual Agents (head-architect, quantity-surveyor, error-auditor, ALL)
- LLM Services (7 Ollama models)
- Master Coordinator (Central Nervous System)

**Reasoning Controls:**
- Detail Level: 1-10 slider
- Reasoning Methods: CoT, CoA, ToT, GoT
- Advanced: Deep Research, Creativity, Concept Tuning, Formal Verification
- Planning: Depth (3-15 steps), Confidence (50-99%), Auto-present plans
- Model Settings: Temperature (0-1), Max Tokens (500-4000)

**Quick Presets:**
- ⚡ Quick Response (detail=3, basic)
- 🧠 Balanced Analysis (detail=7, CoT + research)
- 🚀 Maximum Intelligence (detail=10, all features)

### 2. System Monitoring (`/systems`)

**60+ Systems Monitored:**
- Core Orchestration: centralNervousSystem, syndicateFactory, constructionOrchestrator, statePersistence
- LLM Services: ollamaService, llmService
- Memory Systems: sharedMemory, worldModel, contextEngine, advancedMemoryIntegration, conceptOrchestratorAgent, threePillars
- Learning Systems: alphaGnome, quantumEvolution, ultraFastTransformer, alphaFold, boundedA2C, adaptiveMeta, quantumMDP, quantumInspired, eliteMDP, collectiveMDP, neuralOptimizer
- Quantum Engines: quantumSuperpositionEngine, quantumNodeEngine, quantumCoherenceEngine, quantumEntanglementEngine, quantumSystemOrchestrator
- Formal Reasoning: formalReasoningMaster, autoformalizationEngine, formalVerificationOrchestrator
- Proactive Prevention: proactiveCredibilityMaster, proactiveInferenceReliabilityMaster, proactiveVeracityJudgeMaster, orchestratorCreativityIntegrator, orchestratorOvertrainingPrevention
- Construction Services: visionEngine, hoaiCompliance, quantityTakeoff, errorDetection, bidEvaluation, boqGenerator, tenderGenerator, planValidator
- Enhancements: comprehensiveEnhancements, orchestratorQuantumQuantization

**Adaptive Detail Levels:**
- **Summary:** 🟢 Status + key metrics (lightweight)
- **Detailed:** 🟡 Full metrics + config + graphs + logs + connections
- **Deep State:** 🔴 Complete internal state + database + debug info

**Features:**
- Search by system name/ID
- Filter by category
- Real-time WebSocket updates (2-second intervals)
- Category grouping
- Status indicators

### 3. Human-in-the-Loop (`/mailbox`, `/notifications`, `/plans`)

**Mailbox (`/mailbox`):**
- Priority sorting: Critical, High, Medium, Low
- Categories: Plan Approvals, Error Escalations, Agent Requests, System Alerts, Compliance Issues
- Quick actions: ✅ Approve, ❌ Reject, ⏰ Defer, 💬 Respond
- Expandable message details
- Response tracking

**Notifications (`/notifications`):**
- Real-time toast notifications
- Filter by type: Plan Analysis, Errors, Compliance, Escalations, Learning
- Mark read/unread
- Historical feed
- Badge counters

**Plan Review (`/plans`):**
- HOAI LP 6 & LP 7 phase breakdown
- Interactive plan editing
- Reconsideration triggers:
  - 💰 Focus on Cost Optimization
  - 📐 Increase LP 6 Detail
  - 🔀 Add Alternatives
  - ✏️ Custom Prompt
- Approval workflow
- Side-by-side comparison

### 4. Construction Projects (`/projects`)

- HOAI LP 6 & 7 pipeline visualization
- Real-time plan processing status
- Active project tracking
- Compliance rate monitoring
- Progress gauges

## API Reference

### REST Endpoints

**System Monitoring:**
```
GET  /api/systems                           # List all systems
GET  /api/systems/:id/status                # System health
GET  /api/systems/:id/state?detailLevel=... # Adaptive state
GET  /api/systems/:id/metrics               # Metrics
GET  /api/systems/:id/logs?limit=100        # Logs
```

**LLM Chat:**
```
POST /api/chat/send                         # Send message
GET  /api/chat/history/:agentId?limit=50    # History
POST /api/chat/configure                    # Configure reasoning
```

**Human-in-Loop:**
```
GET  /api/humanloop/notifications           # Notifications
GET  /api/humanloop/mailbox                 # Mailbox
POST /api/humanloop/respond                 # Respond to escalation
POST /api/humanloop/approve-plan            # Plan approval
```

**Construction:**
```
GET  /api/construction/projects             # Projects
GET  /api/construction/plans/status         # Plan status
GET  /api/construction/projects/logs        # Construction logs
GET  /api/construction/plans/events         # Plan events
GET  /api/construction/escalations          # Escalations
```

### WebSocket Events

**Subscribe/Unsubscribe:**
```javascript
socket.emit('subscribeToSystem', systemId);
socket.emit('unsubscribeFromSystem', systemId);
```

**Receive Events:**
```javascript
socket.on('systemUpdate', (data) => { ... });
socket.on('chatMessage', (data) => { ... });
socket.on('escalation', (data) => { ... });
socket.on('planPresentation', (data) => { ... });
socket.on('notificationNew', (data) => { ... });
```

## Design System

### Color Palette

```css
Blueprint Dark: #0A2647  /* Background */
Blueprint Grid: #144272  /* Grid lines */
Steel: #6B7280           /* Frames, borders */
Concrete: #A8A9AD        /* Secondary elements */
Construction Orange: #FF6B35  /* Accents, CTAs */
Safety Yellow: #FFB800   /* Warnings */
Compliance Green: #00D9FF /* Success, status */
Error Red: #FF0044       /* Errors, critical */
```

### Typography

- **Headings:** Roboto Condensed (industrial)
- **Body:** Inter (readable)
- **Code/Data:** JetBrains Mono (monospace)
- **Architectural:** Bebas Neue (bold, uppercase)

### Components

- `ConstructionLayout` - Main layout with sidebar
- `BlueprintPanel` - Panel with blueprint texture
- `SystemCard` - System status card
- `MetricGauge` - Circular metric visualization
- `LLMChatWindow` - Chat interface
- `ReasoningControlPanel` - LLM configuration
- `SystemDetailView` - Adaptive system display

## Troubleshooting

### Frontend won't start

```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```

### Backend connection failed

1. Check backend is running: `curl http://localhost:3001/health`
2. Check startfullsyndicate.js is running
3. Verify port 3001 is not in use: `lsof -i :3001`

### WebSocket not connecting

1. Check Socket.IO server started in backend
2. Verify CORS origins include localhost:3002
3. Check browser console for connection errors

### No systems showing

1. Verify orchestrator initialized successfully
2. Check `orchestrator.connectOrchestrator(this)` called
3. Query `/api/systems` endpoint directly

## Development Tips

### Hot Reload

Next.js supports hot module replacement - changes auto-refresh

### Debug Mode

Set in `.env.local`:
```
NEXT_PUBLIC_DEBUG=true
```

### Custom API URL

Set in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://your-server:3001
NEXT_PUBLIC_WS_URL=ws://your-server:3001
```

### Add New System to Monitoring

Edit `src/web/SystemMonitoringCollector.js`:
```javascript
this.systemCategories = {
  'Your Category': [
    'newSystemName',
    'anotherSystemName'
  ]
};
```

## Production Deployment

### Build Frontend

```bash
cd web-gui-construction
pnpm build
pnpm start  # Production server
```

### Environment Variables

Create `.env.production`:
```
NEXT_PUBLIC_API_URL=https://your-production-api.com
NEXT_PUBLIC_WS_URL=wss://your-production-api.com
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name construction.syndicate.ai;

    location / {
        proxy_pass http://localhost:3002;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }

    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Support

For issues or questions, refer to the main project documentation.

---

**Elite Construction Syndicate GUI v1.0.0**
Built with TOP 1% Expert Development Standards

