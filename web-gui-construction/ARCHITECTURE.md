# 🏗️ Construction Syndicate GUI - Technical Architecture

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (Browser)                      │
│                    http://localhost:3002                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐          ┌──────────────────────┐
│  HTTP REST API   │          │  WebSocket (Socket.IO)│
│  Port 3001       │          │  Port 3001            │
└────────┬─────────┘          └─────────┬─────────────┘
         │                              │
         └──────────────┬───────────────┘
                        │
                        ▼
        ┌────────────────────────────────────┐
        │  CONSTRUCTION GUI SERVER            │
        │  src/web/construction-gui-server.js │
        │  - Express.js                       │
        │  - Socket.IO                        │
        │  - SystemMonitoringCollector        │
        └───────────────┬────────────────────┘
                        │
                        ▼
        ┌────────────────────────────────────┐
        │  MASTER ORCHESTRATOR                │
        │  MasterConstructionSyndicateOrch... │
        │  - All 60+ systems                  │
        │  - LLM services                     │
        │  - Database access                  │
        └────────────────────────────────────┘
```

## Component Architecture

### Frontend (Next.js)

```
pages/
├── _app.jsx              # Root with ConstructionLayout
├── index.jsx             # Dashboard
├── chat.jsx              # LLM Chat Interface
├── systems.jsx           # System Monitoring
├── mailbox.jsx           # Mailbox
├── notifications.jsx     # Notifications
├── plans.jsx             # Plan Review
├── projects.jsx          # Construction Projects
└── settings.jsx          # Settings

components/
├── chat/
│   ├── ChatSelector.jsx          # Target selection
│   ├── LLMChatWindow.jsx         # Chat interface
│   └── ReasoningControlPanel.jsx # Reasoning config
├── monitoring/
│   ├── SystemSelector.jsx        # System dropdown
│   ├── SystemDetailView.jsx      # Adaptive display
│   └── views/
│       ├── SummaryView.jsx       # Level 1
│       ├── DetailedView.jsx      # Level 2
│       └── DeepStateView.jsx     # Level 3
├── humanloop/
│   ├── MailboxMessage.jsx        # Message display
│   ├── NotificationToast.jsx     # Toast notifications
│   └── PlanEditor.jsx            # Plan editing
└── shared/
    ├── ConstructionLayout.jsx    # Main layout
    ├── BlueprintPanel.jsx        # Panel component
    ├── SystemCard.jsx            # System card
    └── MetricGauge.jsx           # Gauge visualization
```

### Backend (Express + Socket.IO)

```
src/web/
├── construction-gui-server.js    # Main server
├── SystemMonitoringCollector.js  # Metrics collector
└── log-monitoring-server.js      # Extended with construction endpoints
```

## Data Flow

### System Monitoring Flow

```
1. User selects system in dropdown
   ↓
2. Frontend sends HTTP GET /api/systems/:id/state?detailLevel=summary
   ↓
3. Backend calls SystemMonitoringCollector.extractSystemData()
   ↓
4. Collector accesses system via orchestrator reference
   ↓
5. Extracts metrics based on detail level:
   - Summary: getStatus() + 4-6 key metrics
   - Detailed: getMetrics() + config + performance + logs
   - Deep: getRecoverableState() + full dump + DB queries
   ↓
6. Returns JSON to frontend
   ↓
7. Frontend renders appropriate view component
   ↓
8. WebSocket subscribes to real-time updates
   ↓
9. Every 2 seconds: Backend broadcasts systemUpdate event
   ↓
10. Frontend updates display without refresh
```

### LLM Chat Flow

```
1. User types message + selects target + configures reasoning
   ↓
2. Frontend sends POST /api/chat/send with:
   {
     target: { type: 'agent|ollama|coordinator', id: '...' },
     message: "...",
     reasoningConfig: { enableCoT: true, ... }
   }
   ↓
3. Backend routes to appropriate handler:
   - Agent: orchestrator.agents.get(id)
   - Ollama: orchestrator.ollamaService.generate()
   - Coordinator: orchestrator.centralNervousSystem.routeDecisionThroughLLM()
   ↓
4. Backend builds enhanced prompt based on reasoning config
   ↓
5. LLM processes with configured methods
   ↓
6. Response sent back to frontend
   ↓
7. Frontend renders in chat window with markdown + syntax highlighting
```

### Human-in-Loop Flow

```
1. System detects issue requiring human review
   ↓
2. Creates escalation in database
   ↓
3. Backend broadcasts 'escalation' WebSocket event
   ↓
4. Frontend shows toast notification
   ↓
5. Adds to mailbox inbox
   ↓
6. User reviews in mailbox page
   ↓
7. User takes action (approve/reject/defer/respond)
   ↓
8. Frontend sends POST /api/humanloop/respond
   ↓
9. Backend updates database + notifies orchestrator
   ↓
10. Removes from mailbox
```

## Database Schema

### Required Tables

```sql
-- System logs
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    system_id VARCHAR(200),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    level VARCHAR(20),
    message TEXT,
    details JSONB
);

-- System metrics
CREATE TABLE system_metrics (
    id SERIAL PRIMARY KEY,
    system_id VARCHAR(200),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metrics JSONB
);

-- Chat history
CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(200),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    from_user BOOLEAN,
    message TEXT,
    reasoning_config JSONB
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100),
    title TEXT,
    message TEXT,
    priority VARCHAR(20),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Escalations
CREATE TABLE escalations (
    id VARCHAR(200) PRIMARY KEY,
    priority VARCHAR(20),
    category VARCHAR(100),
    title TEXT,
    description TEXT,
    context JSONB,
    solutions JSONB,
    status VARCHAR(50),
    response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Plans
CREATE TABLE construction_plans (
    id VARCHAR(200) PRIMARY KEY,
    title TEXT,
    type VARCHAR(50),
    status VARCHAR(50),
    confidence DECIMAL,
    agent_id VARCHAR(200),
    sections JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);
```

## Performance Considerations

### Optimization Strategies

1. **Caching:** 5-second cache for summary-level system data
2. **Debouncing:** WebSocket updates limited to 2-second intervals
3. **Lazy Loading:** Deep state inspection loaded on-demand
4. **Virtual Scrolling:** For large system lists and logs
5. **Code Splitting:** Next.js automatic per-page splitting

### Load Testing Targets

- Handle 1000+ WebSocket messages/second
- Support 50+ concurrent users
- <100ms API response time (summary level)
- <500ms API response time (detailed level)
- <2s API response time (deep state level)

## Security

### Authentication (Future)

- JWT tokens for API authentication
- Role-based access control
- Session management
- Secure WebSocket connections (WSS)

### Current Development Mode

- No authentication (development only)
- CORS enabled for localhost
- All endpoints accessible

## Extension Points

### Adding New Pages

1. Create page in `src/pages/your-page.jsx`
2. Add route to `ConstructionLayout.jsx` navigation
3. Import shared components
4. Use `api` client for backend communication

### Adding New System Categories

1. Edit `SystemMonitoringCollector.js`:
   ```javascript
   this.systemCategories = {
     'New Category': ['system1', 'system2']
   };
   ```

2. Systems auto-appear in dropdown

### Adding New API Endpoints

1. Add route in `construction-gui-server.js`:
   ```javascript
   this.app.get('/api/your/endpoint', async (req, res) => {
     // Implementation
   });
   ```

2. Add client method in `src/services/api.js`:
   ```javascript
   async yourMethod() {
     const response = await fetch(`${API_URL}/api/your/endpoint`);
     return response.json();
   }
   ```

## Monitoring & Debugging

### Server Logs

Backend logs all requests:
```
📡 GET /api/systems
📡 POST /api/chat/send
```

### Browser Console

Frontend logs WebSocket events:
```
🔌 WebSocket connected
📊 System update received: centralNervousSystem
```

### Health Checks

- Backend: http://localhost:3001/health
- Systems list: http://localhost:3001/api/systems

---

**TOP 1% Expert Implementation**
Construction Syndicate GUI - Technical Documentation v1.0.0

